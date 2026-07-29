export default function TestimonialsLoading() {
  return (
    <main style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      <section className="testimonials-page__section">

        {/* Header skeleton */}
        <div className="testimonials-list__header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="skeleton skeleton--eyebrow" />
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--subtitle" />
          </div>
          <div className="skeleton skeleton--btn" />
        </div>

        {/* Cards skeleton grid */}
        <div className="testimonials-page__grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="testimonial-card testimonial-card--skeleton">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="skeleton skeleton--avatar" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <div className="skeleton skeleton--name" />
                  <div className="skeleton skeleton--date" />
                </div>
                <div className="skeleton skeleton--stars" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div className="skeleton skeleton--text" />
                <div className="skeleton skeleton--text" />
                <div className="skeleton skeleton--text skeleton--text-short" />
              </div>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}
