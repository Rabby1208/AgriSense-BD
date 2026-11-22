import "../styles/page-hero.css";

function PageHero({ eyebrow, title, description, icon, children }) {
  const Icon = icon;

  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <div className="page-hero-content">
          {eyebrow && <span className="page-hero-eyebrow">{eyebrow}</span>}

          <h1>{title}</h1>

          {description && <p>{description}</p>}

          {children && <div className="page-hero-actions">{children}</div>}
        </div>

        {Icon && (
          <div className="page-hero-icon" aria-hidden="true">
            <Icon size={64} strokeWidth={1.3} />
          </div>
        )}
      </div>
    </section>
  );
}

export default PageHero;