import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import Button from "../components/ui/Button";
import SearchBar from "../components/search/SearchBar";
import { useContent } from "../contexts/ContentContext";
import type { SessionMeta } from "../content/sessions";

const CATEGORY_STYLES: Record<string, { icon: string; gradient: string }> = {
  ruecken: {
    icon: "🌿",
    gradient:
      "linear-gradient(135deg, var(--color-sage-100) 0%, var(--color-sage-50) 100%)",
  },
  balance: {
    icon: "🍃",
    gradient:
      "linear-gradient(135deg, var(--color-phase-cooldown-bg) 0%, var(--color-sage-50) 100%)",
  },
  schulter: {
    icon: "🌸",
    gradient:
      "linear-gradient(135deg, var(--color-phase-focus-bg) 0%, var(--color-sand-50) 100%)",
  },
  "herz-kreislauf": {
    icon: "🌺",
    gradient:
      "linear-gradient(135deg, var(--color-terracotta-100) 0%, var(--color-sand-50) 100%)",
  },
  ganzkoerper: {
    icon: "🌳",
    gradient:
      "linear-gradient(135deg, var(--color-sage-200) 0%, var(--color-sage-50) 100%)",
  },
  gymnastikstab: {
    icon: "🎋",
    gradient:
      "linear-gradient(135deg, var(--color-sand-200) 0%, var(--color-sand-50) 100%)",
  },
  "redondo-ball": {
    icon: "🔮",
    gradient:
      "linear-gradient(135deg, var(--color-phase-focus-bg) 0%, var(--color-sage-50) 100%)",
  },
};

function getCategoryStyle(slug: string) {
  return (
    CATEGORY_STYLES[slug] || {
      icon: "🌱",
      gradient:
        "linear-gradient(135deg, var(--color-sage-100) 0%, var(--color-surface) 100%)",
    }
  );
}

function SessionsPage(): JSX.Element {
  const { sessions: allSessions, categories, loading, error } = useContent();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="container stack">
        <div className="sessions-empty animate-fade-up fill-backwards">
          <div className="sessions-empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <h2 className="sessions-empty-title">Lade Trainingsstunden...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container stack">
        <div className="sessions-empty animate-fade-up fill-backwards">
          <div className="sessions-empty-icon">⚠️</div>
          <h2 className="sessions-empty-title">Fehler beim Laden</h2>
          <p className="sessions-empty-text">{error}</p>
        </div>
      </div>
    );
  }

  const filteredSessions = useMemo(() => {
    let result = allSessions;

    if (selectedCategory) {
      result = result.filter(
        (session) => session.categorySlug === selectedCategory,
      );
    }

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (session) =>
          session.title.toLowerCase().includes(lowerQuery) ||
          session.description?.toLowerCase().includes(lowerQuery) ||
          session.focus?.toLowerCase().includes(lowerQuery),
      );
    }

    return result.sort((a, b) => a.title.localeCompare(b.title, "de"));
  }, [allSessions, query, selectedCategory]);

  const hasActiveFilters = selectedCategory !== null || query.trim() !== "";

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory(null);
  };

  return (
    <div className="container stack">
      {/* Page Header */}
      <header className="sessions-header animate-fade-up fill-backwards">
        <div className="sessions-header-content">
          <h1 className="sessions-title">Trainingsstunden</h1>
          <p className="sessions-subtitle">
            {allSessions.length} strukturierte 45-Minuten-Einheiten für Ihr
            Reha-Training
          </p>
        </div>
        <div className="sessions-search animate-fade-up fill-backwards delay-100">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Stunde suchen..."
          />
        </div>
      </header>

      {/* Category Filter */}
      <nav
        className="sessions-filter animate-fade-up fill-backwards delay-200"
        aria-label="Kategorien"
      >
        <div className="sessions-filter-scroll">
          <button
            type="button"
            className={`sessions-chip ${selectedCategory === null ? "sessions-chip-active" : ""}`}
            onClick={() => setSelectedCategory(null)}
            aria-pressed={selectedCategory === null}
          >
            <span className="sessions-chip-icon">✨</span>
            <span>Alle</span>
            <span className="sessions-chip-count">{allSessions.length}</span>
          </button>
          {categories.map((category) => {
            const style = getCategoryStyle(category.slug);
            return (
              <button
                key={category.slug}
                type="button"
                className={`sessions-chip ${selectedCategory === category.slug ? "sessions-chip-active" : ""}`}
                onClick={() => setSelectedCategory(category.slug)}
                aria-pressed={selectedCategory === category.slug}
              >
                <span className="sessions-chip-icon">{style.icon}</span>
                <span>{category.title}</span>
                <span className="sessions-chip-count">
                  {category.sessions.length}
                </span>
              </button>
            );
          })}
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="sessions-clear"
            onClick={clearFilters}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Zurücksetzen
          </button>
        )}
      </nav>

      {/* Results Info */}
      <div className="sessions-results-info animate-fade-up fill-backwards delay-300">
        <span className="sessions-results-count">
          {filteredSessions.length}{" "}
          {filteredSessions.length === 1 ? "Stunde" : "Stunden"}
        </span>
        {selectedCategory && (
          <span className="sessions-results-filter">
            in {getCategoryStyle(selectedCategory).icon}{" "}
            {categories.find((c) => c.slug === selectedCategory)?.title}
          </span>
        )}
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length > 0 ? (
        <ul className="sessions-grid" aria-label="Trainingsstunden">
          {filteredSessions.map((session, index) => (
            <SessionCard
              key={`${session.categorySlug}-${session.slug}`}
              session={session}
              index={index}
            />
          ))}
        </ul>
      ) : (
        <div className="sessions-empty animate-fade-up fill-backwards">
          <div className="sessions-empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h2 className="sessions-empty-title">Keine Stunden gefunden</h2>
          <p className="sessions-empty-text">
            Versuche andere Suchbegriffe oder wähle eine andere Kategorie.
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" onClick={clearFilters}>
              Filter zurücksetzen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  index,
}: {
  session: SessionMeta;
  index: number;
}): JSX.Element {
  const exerciseCount = session.exercises.length;
  const style = getCategoryStyle(session.categorySlug);
  const delayClass = index < 6 ? `delay-${(index % 6) * 100 + 100}` : "";

  return (
    <li className={`animate-fade-up fill-backwards ${delayClass}`}>
      <article className="session-card-new">
        {/* Card Header with Gradient */}
        <div
          className="session-card-header-new"
          style={{ background: style.gradient }}
        >
          <div className="session-card-category">
            <span className="session-card-category-icon">{style.icon}</span>
            <span className="session-card-category-name">
              {session.categoryTitle}
            </span>
          </div>
          {session.duration && (
            <div className="session-card-duration">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <div
                className="session-card-phase warmup"
                title="Aufwärmen (10 Min)"
              />
              <div
                className="session-card-phase main"
                title="Hauptteil (15 Min)"
              />
              <div
                className="session-card-phase focus"
                title="Schwerpunkt (15 Min)"
              />
              <div
                className="session-card-phase cooldown"
                title="Ausklang (10 Min)"
              />
            </div>
            <span className="session-card-phase-label">
              4 Phasen · {exerciseCount} Übungen
            </span>
          </div>

          {/* Focus Tags */}
          {session.focus && (
            <div className="session-card-tags">
              {session.focus
                .split(",")
                .slice(0, 3)
                .map((tag) => (
                  <span
                    key={`${session.slug}-${tag.trim()}`}
                    className="session-card-tag"
                  >
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </article>
    </li>
  );
}

export default SessionsPage;
