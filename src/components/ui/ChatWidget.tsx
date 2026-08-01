'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
type Msg = { role: 'user' | 'assistant'; content: string };
export default function ChatWidget() {
  const t = useTranslations('chat');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [wa, setWa] = useState<string | undefined>();
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open, loading]);
  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener('open-chat', open);
    return () => window.removeEventListener('open-chat', open);
  }, []);
  async function send() {
    const text = input.trim(); if (!text || loading) return;
    setMsgs((m) => [...m, { role: 'user', content: text }]); setInput(''); setLoading(true);
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: msgs.slice(-6), locale }) });
      const j = await r.json();
      setMsgs((m) => [...m, { role: 'assistant', content: j.reply || t('error') }]);
      if (j.wa) setWa(j.wa);
    } catch { setMsgs((m) => [...m, { role: 'assistant', content: t('error') }]); }
    finally { setLoading(false); }
  }
  return (<>
    <button className="chat-launcher" onClick={() => setOpen((o) => !o)} aria-label={t('title')}>💬</button>
    {open && (
      <div className="chat-panel" role="dialog" aria-label={t('title')}>
        <div className="chat-head"><span>{t('title')}</span><button onClick={() => setOpen(false)} aria-label="close">×</button></div>
        <div className="chat-body">
          {msgs.length === 0 && <div className="chat-msg chat-msg--bot">{t('greeting')}</div>}
          {msgs.map((m, i) => <div key={i} className={`chat-msg chat-msg--${m.role === 'user' ? 'user' : 'bot'}`}>{m.content}</div>)}
          {loading && <div className="chat-msg chat-msg--bot">…</div>}
          {wa && <a className="chat-wa" href={wa} target="_blank" rel="noopener noreferrer">{t('whatsapp')}</a>}
          <div ref={endRef} />
        </div>
        <div className="chat-input">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={t('placeholder')} />
          <button onClick={send} disabled={loading} aria-label={t('send')}>➤</button>
        </div>
      </div>
    )}
  </>);
}
