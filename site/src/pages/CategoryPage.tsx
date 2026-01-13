import { Link, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import { getCategory, type SessionMeta } from "../content/sessions";

const CATEGORY_STYLES: Record<string, { icon: string; gradient: string }> = {
  ruecken: { icon: "🌿", gradient: "linear-gradient(135deg, var(--color-sage-100) 0%, var(--color-sage-50) 100%)" },
  balance: { icon: "🍃", gradient: "linear-gradient(135deg, var(--color-phase-cooldown-bg) 0%, var(--color-sage-50) 100%)" },
  schulter: { icon: "🌸", gradient: "linear-gradient(135deg, var(--color-phase-focus-bg) 0%, var(--color-sand-50) 100%)" },
  "herz-kreislauf": { icon: "🌺", gradient: "linear-gradient(135deg, var(--color-terracotta-100) 0%, var(--color-sand-50) 100%)" },
  ganzkoerper: { icon: "🌳", gradient: "linear-gradient(135deg, var(--color-sage-200) 0%, var(--color-sage-50) 100%)" },
  gymnastikstab: { icon: "🎋", gradient: "linear-gradient(135deg, var(--color-sand-200) 0%, var(--color-sand-50) 100%)" },
  "redondo-ball": { icon: "🔮", gradient: "linear-gradient(135deg, var(--color-phase-focus-bg) 0%, var(--color-sage-50) 100%)" }
};

function getCategoryStyle(slug: string) {
  return CATEGORY_STYLES[slug] || { icon: "🌱", gradient: "linear-gradient(135deg, var(--color-sage-100) 0%, var(--color-surface) 100%)" };
}

function CategoryPage(): JSX.Element {
  const { categorySlug } = useParams();
  const category = categorySlug ? getCategory(categorySlug) : undefined;

  if (!category) {
    return (
      <div className="container">
        <div className="sessions-empty animate-fade-up fill-backwards">
          <div className="sessions-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="sessions-empty-title">Kategorie nicht gefunden</h1>
          <p className="sessions-empty-text">
            Die angeforderte Kategorie existiert nicht.
          </p>
          <Button to="/" variant="secondary">
            Zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  const style = getCategoryStyle(category.slug);

  return (
    <div className="container stack">
      {/* Breadcrumb */}
      <nav className="breadcrumb animate-fade-up fill-backwards" aria-label="Navigation">
        <Link to="/" className="breadcrumb-link">Start</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{category.title}</span>
      </nav>

      {/* Page Header */}
      <header className="category-header animate-fade-up fill-backwards delay-100">
        <div className="category-header-icon" style={{ background: style.gradient }}>
          <span>{style.icon}</span>
        </div>
        <div className="category-header-content">
          <h1 className="category-title">{category.title}</h1>
          {category.description && (
            <p className="category-subtitle">{category.description}</p>
          )}
          {category.focusTags.length > 0 && (
            <div className="category-tags">
              {category.focusTags.map((tag) => (
                <span key={tag} className="category-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Results Info */}
      <div className="sessions-results-info animate-fade-up fill-backwards delay-200">
        <span className="sessions-results-count">
          {category.sessions.length} {category.sessions.length === 1 ? "Stunde" : "Stunden"}
        </span>
        <span className="sessions-results-filter">in dieser Kategorie</span>
      </div>

      {/* Sessions Grid */}
      <ul className="sessions-grid" aria-label={`Stunden in ${category.title}`}>
        {category.sessions.map((session, index) => (
          <SessionCard
            key={session.slug}
            session={{ ...session, categorySlug: category.slug, categoryTitle: category.title }}
            index={index}
            style={style}
          />
        ))}
      </ul>

      {/* Back Button */}
      <div className="animate-fade-up fill-backwards">
        <Link to="/" className="category-back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Alle Kategorien
        </Link>
      </div>
    </div>
  );
}

interface SessionCardProps {
  session: SessionMeta & { categorySlug: string; categoryTitle: string };
  index: number;
  style: { icon: string; gradient: string };
}

function SessionCard({ session, index, style }: SessionCardProps): JSX.Element {
  const exerciseCount = session.exercises.length;
  const delayClass = index < 6 ? `delay-${(index % 6) * 100 + 100}` : "";

  return (
    <li className={`animate-fade-up fill-backwards ${delayClass}`}>
      <article className="session-card-new">
        {/* Card Header with Gradient */}
        <div className="session-card-header-new" style={{ background: style.gradient }}>
          <div className="session-card-category">
            <span className="session-card-category-icon">{style.icon}</span>
            <span className="session-card-category-name">{session.categoryTitle}</span>
          </div>
          {session.duration && (
            <div className="session-card-duration">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {session.duration}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="session-card-body-new">
          <h2 className="session-card-title-new">
            <Link to={`/ordner/${session.categorySlug}/${session.slug}`}>
              {session.title}
            </Link>
          </h2>

          {session.description && (
            <p className="session-card-description-new">
              {session.description}
            </p>
          )}

          {/* Phase Timeline */}
          <div className="session-card-phases">
            <div className="session-card-phase-bar">
              <div className="session-card-phase warmup" title="Aufwärmen (10 Min)" />
              <div className="session-card-phase main" title="Hauptteil (15 Min)" />
              <div className="session-card-phase focus" title="Schwerpunkt (15 Min)" />
              <div className="session-card-phase cooldown" title="Ausklang (10 Min)" />
            </div>
            <span className="session-card-phase-label">4 Phasen · {exerciseCount} Übungen</span>
          </div>

          {/* Focus Tags */}
          {session.focus && (
            <div className="session-card-tags">
              {session.focus.split(",").slice(0, 3).map((tag) => (
                <span key={`${session.slug}-${tag.trim()}`} className="session-card-tag">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <Link
            to={`/ordner/${session.categorySlug}/${session.slug}`}
            className="session-card-link"
          >
            <span>Stunde öffnen</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </article>
    </li>
  );
}

export default CategoryPage;
