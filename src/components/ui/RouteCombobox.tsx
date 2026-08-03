'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';

export interface ComboRoute {
  nameKey: string;
  price: number;
  nameI18n?: Record<string, string>;
}

interface Props {
  routes: ComboRoute[];
  value: string;
  onChange: (label: string, route: ComboRoute | null) => void;
  id?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  showPrice?: boolean;
}

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function getDest(label: string) {
  return (label.includes('→') ? label.split('→').pop()! : label).trim();
}

export default function RouteCombobox({
  routes,
  value,
  onChange,
  id,
  name,
  required,
  placeholder,
  className,
  showPrice = true,
}: Props) {
  const locale = useLocale();
  const t = useTranslations('transferQuote');
  const uid = useId();
  const listboxId = `${uid}lb`;

  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [selectedRoute, setSelectedRoute] = useState<ComboRoute | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const getLabel = (r: ComboRoute) => r.nameI18n?.[locale] ?? r.nameKey;

  // If the field holds an exact city name (pre-filled Trenčín or an already
  // picked city), show the FULL list so the user can switch to another city
  // without deleting the text. Only filter once the user actually types.
  const isExactMatch = routes.some(r => getDest(getLabel(r)) === value.trim());
  const filtered = value.trim() && !isExactMatch
    ? routes.filter(r => normalize(getDest(getLabel(r))).includes(normalize(value)))
    : routes;

  // Sync selectedRoute when value is set externally (prefill or reset)
  useEffect(() => {
    if (!value) { setSelectedRoute(null); return; }
    const found = routes.find(r => getDest(r.nameI18n?.[locale] ?? r.nameKey) === value) ?? null;
    setSelectedRoute(found);
  }, [value, routes, locale]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlighted < 0 || !listRef.current) return;
    const el = listRef.current.children[highlighted] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  // Click outside closes dropdown
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function handleSelect(route: ComboRoute) {
    const dest = getDest(getLabel(route));
    setSelectedRoute(route);
    setOpen(false);
    setHighlighted(-1);
    onChange(dest, route);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value, null);
    setSelectedRoute(null);
    setHighlighted(-1);
    if (!open) setOpen(true);
  }

  function handleFocus() {
    setOpen(true);
    if (highlighted < 0 && filtered.length > 0) setHighlighted(0);
  }

  function toggleOpen() {
    setOpen((o) => {
      const next = !o;
      if (next && highlighted < 0 && filtered.length > 0) setHighlighted(0);
      return next;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        setHighlighted(0);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlighted(h => (h < filtered.length - 1 ? h + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted(h => (h > 0 ? h - 1 : filtered.length - 1));
        break;
      case 'Enter':
        if (highlighted >= 0 && filtered[highlighted]) {
          e.preventDefault();
          handleSelect(filtered[highlighted]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setHighlighted(-1);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={containerRef} className="combobox">
      <input
        type="text"
        id={id}
        name={name}
        required={required}
        className={`booking__input${className ? ` ${className}` : ''}`}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={highlighted >= 0 ? `${listboxId}-opt-${highlighted}` : undefined}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className={`combobox__caret${open ? ' combobox__caret--open' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); toggleOpen(); }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="combobox__dropdown"
        >
          {filtered.map((route, i) => (
            <li
              key={route.nameKey}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={i === highlighted}
              className={`combobox__option${i === highlighted ? ' combobox__option--active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(route); }}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span className="combobox__option-label">{getDest(getLabel(route))}</span>
              {showPrice && <span className="combobox__option-price">{route.price} €</span>}
            </li>
          ))}
        </ul>
      )}
      {showPrice && selectedRoute && (
        <p className="booking__price-hint">
          {t('priceHint', { price: selectedRoute.price })}
        </p>
      )}
    </div>
  );
}
