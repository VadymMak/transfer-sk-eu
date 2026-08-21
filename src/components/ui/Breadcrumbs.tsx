import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumbs__list">
        {items.map((item, i) => (
          <li key={i} className="breadcrumbs__item">
            {i > 0 && <span className="breadcrumbs__sep" aria-hidden="true">›</span>}
            {item.href ? (
              <Link href={item.href} className="breadcrumbs__link">{item.label}</Link>
            ) : (
              <span className="breadcrumbs__current" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
