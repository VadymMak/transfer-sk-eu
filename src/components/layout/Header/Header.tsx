'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher/LanguageSwitcher';

export default function Header({
  logoUrl,
  whatsappBookingLink = '#',
  activeLocales,
}: {
  logoUrl?: string;
  whatsappBookingLink?: string;
  activeLocales?: string[];
}) {
  const locale = useLocale();
  const tHeader = useTranslations('Header');
  const navLinks = [
    { href: `/${locale}/#strecken`,   label: tHeader('transferStrecken') },
    { href: `/${locale}/#fuhrpark`,   label: tHeader('transferFuhrpark') },
    { href: `/${locale}/#leistungen`, label: tHeader('transferLeistungen') },
    { href: `/${locale}/#galerie`,    label: tHeader('transferGalerie') },
    { href: `/${locale}/#kontakt`,    label: tHeader('transferKontakt') },
  ];

  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const threshold = 64;

      setScrolled(currentY > 40);

      if (currentY < threshold) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 5) {
        setVisible(false);
      } else if (currentY < lastScrollY.current - 5) {
        setVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerClass = [
    'header',
    scrolled ? 'header--scrolled' : '',
    visible ? '' : 'header--hidden',
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClass}>
      <div className="header__inner">
        <Link href={`/${locale}`} className="header__logo">
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logoUrl} alt="Logo" className="header__logo-img" />
          ) : (
            <>Transfer <span className="header__logo-span">GmbH</span></>
          )}
        </Link>

        <nav className="header__nav">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="header__nav-link">
              {link.label}
            </a>
          ))}
          <LanguageSwitcher variant="dropdown" locales={activeLocales} />
          <a href={`/${locale}/#angebot`} className="header__btn-reserve">
            {tHeader('transferBuchen')}
          </a>
          <a
            href={whatsappBookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="header__btn-whatsapp"
          >
            <WhatsAppIcon size={14} />
            WhatsApp
          </a>
        </nav>

        <button
          className="header__mobile-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {menuOpen && (
          <nav className="header__mobile-nav">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="header__mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={`/${locale}/#angebot`}
              className="header__mobile-btn-reserve"
              onClick={() => setMenuOpen(false)}
            >
              {tHeader('transferBuchen')}
            </a>
            <a
              href={whatsappBookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="header__mobile-btn-wa"
              onClick={() => setMenuOpen(false)}
            >
              <WhatsAppIcon size={16} />
              WhatsApp
            </a>
            <div className="header__mobile-lang">
              <LanguageSwitcher variant="inline" locales={activeLocales} />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
