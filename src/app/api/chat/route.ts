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

  const { message, history, locale } = (await req.json()) as { message?: string; history?: { role: 'user' | 'assistant'; content: string }[]; locale?: string };

  const LANG: Record<string, string> = {
    sk: 'Odpovedaj po slovensky.',
    cs: 'Odpovídej česky.',
    en: 'Reply in English.',
    de: 'Antworte auf Deutsch.',
    ru: 'Отвечай по-русски.',
    uk: 'Відповідай українською.',
  };
  const siteLang = LANG[locale ?? 'de'] ?? LANG.de;
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
    `- LANGUAGE (critical): Default reply language for this site: "${siteLang}". Use it by default, BUT if the customer's latest message is clearly written in another language, reply in THAT language instead. Write your ENTIRE reply in ONE language only. The FACTS below are in Slovak — you MUST translate any fact you use into your reply language. NEVER mix two languages and never leave Slovak words in a non-Slovak reply.`,
    '- TONE: Be warm, welcoming and genuinely helpful — like a friendly concierge, never dry, stiff or purely transactional. Use natural, hospitable phrasing in the customer\'s language, and invite the next step in a friendly way (e.g. that you would be glad to help arrange the trip). A little warmth and politeness is better than sounding like a form. Keep it concise but human. Politely decline questions unrelated to the company services.',
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
      model: 'gpt-4o-mini', messages: messages as any, temperature: 0.35, max_tokens: 400,
    });
    const reply = resp.choices[0]?.message?.content ?? '';
    return NextResponse.json({ reply, wa: `https://wa.me/${WA}` });
  } catch (e) {
    return NextResponse.json({ error: 'ai_failed', detail: String(e) }, { status: 500 });
  }
}
