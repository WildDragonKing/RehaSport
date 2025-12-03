import { Link, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import { getCategory } from "../content/sessions";

// Clock Icon
function ClockIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CategoryPage(): JSX.Element {
  const { categorySlug } = useParams();
  const category = categorySlug ? getCategory(categorySlug) : undefined;

  if (!category) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h1 className="empty-state-title">Kategorie nicht gefunden</h1>
          <p className="empty-state-description">
            Die angeforderte Kategorie existiert nicht.
          </p>
          <Button to="/" variant="secondary">
            Zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container stack">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Navigation">
        <Link to="/" className="breadcrumb-link">Start</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{category.title}</span>
      </nav>

      {/* Page Header */}
      <header className="stack-sm">
        <h1>{category.title}</h1>
        {category.description && (
          <p className="text-muted" style={{ fontSize: "1.125rem", maxWidth: "640px" }}>
            {category.description}
          </p>
        )}
        {category.focusTags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {category.focusTags.map((tag) => (
              <span key={tag} className="badge badge-primary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Sessions Grid */}
      <section aria-label={`Stunden in ${category.title}`}>
        <div className="grid-sessions">
          {category.sessions.map((session) => (
            <Link
              key={session.slug}
              to={`/ordner/${category.slug}/${session.slug}`}
              className="card card-hover card-body session-card"
            >
              <div className="session-card-header">
                <h2 className="session-card-title">{session.title}</h2>
                {session.duration && (
                  <span className="session-card-duration">
                    <ClockIcon />
                    {session.duration}
                  </span>
                )}
              </div>

              {/* Phase Dots */}
              <div className="session-card-phases">
                <span className="session-card-phase-dot warmup" title="Aufwärmen" />
                <span className="session-card-phase-dot main" title="Hauptteil" />
                <span className="session-card-phase-dot focus" title="Schwerpunkt" />
                <span className="session-card-phase-dot cooldown" title="Ausklang" />
              </div>

              {session.description && (
                <p className="session-card-description">{session.description}</p>
              )}

              {session.focus && (
                <p className="text-light" style={{ fontSize: "0.875rem" }}>
                  Fokus: {session.focus}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Back Button */}
      <div>
        <Button to="/" variant="ghost">
          ← Alle Kategorien
        </Button>
      </div>
    </div>
  );
}

export default CategoryPage;
