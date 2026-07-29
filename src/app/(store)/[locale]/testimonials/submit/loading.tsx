export default function SubmitLoading() {
  return (
    <main style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      <section className="testimonials-page__form-section">
        <div className="skeleton skeleton--back" />
        <div className="skeleton skeleton--title" style={{ marginTop: '1.5rem' }} />
        <div className="skeleton skeleton--subtitle" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          <div className="skeleton skeleton--field" />
          <div className="skeleton skeleton--field skeleton--field-tall" />
          <div className="skeleton skeleton--btn" style={{ width: '160px' }} />
        </div>
      </section>
    </main>
  );
}
