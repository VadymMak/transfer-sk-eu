import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STORE_SLUG = process.env.STORE_SLUG ?? '';
const WA_GENERAL = '421951287892';

// ─── Rate limit (in-memory; MVP) ─────────────────────────────────────────────
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

// ─── Upcoming tours block ─────────────────────────────────────────────────────
async function fetchUpcomingTripsBlock(storeId: string, locale: string): Promise<string> {
  const now = new Date();
  const trips = await db.trip.findMany({
    where: { storeId, active: true, dateStart: { gte: now } },
    orderBy: { dateStart: 'asc' },
    include: {
      translations: { where: { OR: [{ locale }, { locale: 'sk' }] } },
    },
    take: 10,
  });
  if (trips.length === 0) return '';

  const lines = trips.map((trip) => {
    const tr = trip.translations.find((t) => t.locale === locale)
      ?? trip.translations.find((t) => t.locale === 'sk');
    if (!tr) return null;
    const d = trip.dateStart;
    const date = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    const price = `${trip.price}€`;
    const priceChild = trip.priceChild ? `, child: ${trip.priceChild}€` : '';
    const deposit = trip.prepayment ? `, deposit: ${trip.prepayment}€` : '';
    const phone = trip.bookingPhone?.replace(/\D/g, '') ?? null;
    const waLink = phone ? `https://wa.me/${phone}` : null;
    const pageUrl = `/${locale}/vylety/${trip.slug}`;
    const booking = waLink ? `Book via WhatsApp: ${waLink}` : `Book: see page`;
    return `• ${tr.name} | Date: ${date} | Adult: ${price}${priceChild}${deposit} | ${booking} | Page: ${pageUrl}`;
  }).filter(Boolean);

  return lines.length > 0
    ? 'UPCOMING BUS TOURS (answer from these facts; cite page links):\n' + lines.join('\n')
    : '';
}

// ─── Legal block (stable, cacheable prefix) ───────────────────────────────────
const LEGAL_SK = [
  'FIRMA A PRÁVNE ÚDAJE:',
  '- Prevádzkovateľ: Vitalii Khilko, K. Šmidkeho 2938/8, 911 08 Trenčín, Slovensko. IČO 57093865, DIČ 3120653360, neplatca DPH.',
  '- Licencovaná taxislužba — preukaz vodiča vozidla taxislužby č. T45487 (vydaný 11. 07. 2025, Okresný úrad Trenčín).',
  '- Kontakt: +421 951 287 892, info@transfersk.eu.',
  '- Ochrana údajov (GDPR): údaje z formulára (meno, telefón, trasa, dátum a čas, číslo letu) používame len na vybavenie transferu a komunikáciu; uchovávame najviac 7 rokov; zákazník má právo na prístup, opravu, vymazanie, obmedzenie a prenosnosť údajov; sťažnosť možno podať na Úrad na ochranu osobných údajov SR (dataprotection.gov.sk). Podrobnosti na stránkach Impressum a Ochrana osobných údajov.',
].join('\n');

const LANG: Record<string, string> = {
  sk: 'Odpovedaj po slovensky.',
  cs: 'Odpovídej česky.',
  en: 'Reply in English.',
  de: 'Antworte auf Deutsch.',
  ru: 'Отвечай по-русски.',
  uk: 'Відповідай українською.',
  pl: 'Odpowiadaj po polsku.',
};

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim();
  if (limited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const body = (await req.json()) as {
    message?: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
    locale?: string;
    hp?: string;
  };

  // Honeypot: bots fill hidden fields, humans don't
  if (body.hp) return NextResponse.json({ error: 'bad_input' }, { status: 400 });

  const { message, history, locale } = body;
  const siteLang = LANG[locale ?? 'de'] ?? LANG.de;
  if (!message || message.length > 500) return NextResponse.json({ error: 'bad_input' }, { status: 400 });

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG }, select: { id: true } });
  if (!store) return NextResponse.json({ error: 'no_store' }, { status: 500 });

  // Fetch tours and RAG context in parallel
  const [toursBlock, ragContext] = await Promise.all([
    fetchUpcomingTripsBlock(store.id, locale ?? 'sk').catch(() => ''),
    (async () => {
      try {
        const emb = await generateEmbedding(message);
        const vec = `[${emb.join(',')}]`;
        const rows = await db.$queryRawUnsafe<{ content: string }[]>(
          `SELECT content FROM "StoreKnowledge" WHERE "storeId"=$1 ORDER BY embedding <=> $2::vector LIMIT 6`,
          store.id, vec,
        );
        return rows.map((r) => '- ' + r.content).join('\n');
      } catch { return ''; }
    })(),
  ]);

  const system = [
    'You are the virtual assistant for "Transfer SK-EU", a passenger transport, bus-tour and delivery',
    'company based in Trenčín, Slovakia. You help visitors on the company website.',
    'RULES:',
    '- Answer ONLY using the FACTS below (company knowledge base). Never invent prices, routes, times,',
    '  policies, dates or availability. If it is not in the FACTS, say you do not have that detail and offer to',
    `  connect the customer via WhatsApp (+${WA_GENERAL}).`,
    '- Prices in the FACTS are fixed per vehicle or per person (tours). Quote exactly as given.',
    '- For a transfer request, collect: pickup, destination, date, time, passengers, luggage. Then summarise',
    `  and invite the customer to confirm on WhatsApp: https://wa.me/${WA_GENERAL}`,
    '- For bus-tour questions: answer from the UPCOMING BUS TOURS block in FACTS. Always include the',
    '  tour page link. For booking, give the per-tour WhatsApp number from FACTS — never a generic number.',
    '  If no matching tour is listed, say so honestly and invite them to check the tours page at /vylety.',
    `- LANGUAGE (critical): Default reply language for this site: "${siteLang}". Use it by default, BUT if the customer's latest message is clearly written in another language, reply in THAT language instead. Write your ENTIRE reply in ONE language only. The FACTS below are in Slovak — you MUST translate any fact you use into your reply language. NEVER mix two languages and never leave Slovak words in a non-Slovak reply.`,
    '- TONE: Be warm, welcoming and genuinely helpful — like a friendly concierge, never dry, stiff or purely transactional. Use natural, hospitable phrasing in the customer\'s language, and invite the next step in a friendly way. Keep it concise but human. Politely decline questions unrelated to the company services.',
    '',
    'FACTS:',
    LEGAL_SK,
    ...(toursBlock ? ['\n' + toursBlock] : []),
    ...(ragContext ? ['\n' + ragContext] : []),
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
    return NextResponse.json({ reply, wa: `https://wa.me/${WA_GENERAL}` });
  } catch (e) {
    return NextResponse.json({ error: 'ai_failed', detail: String(e) }, { status: 500 });
  }
}
