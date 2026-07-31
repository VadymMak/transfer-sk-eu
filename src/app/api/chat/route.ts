import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STORE_SLUG = process.env.STORE_SLUG ?? '';
const WA = '421951287892';

// best-effort in-memory rate limit (MVP; swap for Upstash/KV later)
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now(), win = 10 * 60 * 1000, rec = hits.get(ip);
  if (!rec || now - rec.t > win) { hits.set(ip, { n: 1, t: now }); return false; }
  rec.n++; return rec.n > 25;
}
function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY missing');
  return new OpenAI({ apiKey: key });
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim();
  if (limited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const { message, history } = (await req.json()) as { message?: string; history?: { role: 'user' | 'assistant'; content: string }[] };
  if (!message || message.length > 500) return NextResponse.json({ error: 'bad_input' }, { status: 400 });

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG }, select: { id: true } });
  if (!store) return NextResponse.json({ error: 'no_store' }, { status: 500 });

  // RAG retrieval from StoreKnowledge
  let context = '';
  try {
    const emb = await generateEmbedding(message);
    const vec = `[${emb.join(',')}]`;
    const rows = await db.$queryRawUnsafe<{ content: string }[]>(
      `SELECT content FROM "StoreKnowledge" WHERE "storeId"=$1 ORDER BY embedding <=> $2::vector LIMIT 6`,
      store.id, vec,
    );
    context = rows.map((r) => '- ' + r.content).join('\n');
  } catch { context = ''; }

  const system = [
    'You are the virtual assistant for "Transfer SK-EU", a passenger transport, tourist-trip and delivery',
    'company based in Trenčín, Slovakia. You help visitors on the company website.',
    'RULES:',
    '- Answer ONLY using the FACTS below (company knowledge base). Never invent prices, routes, times,',
    '  policies or availability. If it is not in the FACTS, say you do not have that detail and offer to',
    `  connect the customer via WhatsApp (+421 951 287 892).`,
    '- Prices in the FACTS are fixed per vehicle. When quoting, present the fixed price and add that the',
    '  final booking is confirmed via WhatsApp.',
    '- For a transfer request, collect: pickup, destination, date, time, passengers, luggage. Then summarise',
    `  and invite the customer to confirm on WhatsApp: https://wa.me/${WA}`,
    '- Tourist trips change regularly — for the current tour offer, direct the customer to WhatsApp or the',
    '  Telegram channel; do not state a specific tour price/date unless it is in the FACTS.',
    '- Reply in the SAME language as the customer (Slovak, English, German, Russian or Ukrainian).',
    '- Be concise, friendly, professional. Politely decline questions unrelated to the company services.',
    '',
    'FACTS:',
    context || '(no facts retrieved)',
  ].join('\n');

  const messages = [
    { role: 'system' as const, content: system },
    ...((history ?? []).slice(-6)),
    { role: 'user' as const, content: message },
  ];

  try {
    const resp = await getOpenAI().chat.completions.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: 'gpt-4o-mini', messages: messages as any, temperature: 0.3, max_tokens: 400,
    });
    const reply = resp.choices[0]?.message?.content ?? '';
    return NextResponse.json({ reply, wa: `https://wa.me/${WA}` });
  } catch (e) {
    return NextResponse.json({ error: 'ai_failed', detail: String(e) }, { status: 500 });
  }
}
