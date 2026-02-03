import { Link } from "react-router-dom";

import Button from "../components/ui/Button";
import { useContent } from "../contexts/ContentContext";

// Icons
function ArrowRightIcon(): JSX.Element {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    ruecken: "🌿",
    balance: "🍃",
    schulter: "🌸",
    "herz-kreislauf": "🌺",
    ganzkoerper: "🌳",
    gymnastikstab: "🎋",
    "redondo-ball": "🔮",
  };
  return icons[slug] || "🌱";
}

function HomePage(): JSX.Element {
  const { categories, exercises, loading } = useContent();

  const totalSessions = categories.reduce(
    (acc, cat) => acc + cat.sessions.length,
    0,
  );
  const totalExercises = exercises.length;

  if (loading) {
    return (
      <div className="stack-lg">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">Lade...</h1>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Section 1: Hero + Categories (combined per Plan section 3) */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title animate-fade-up fill-backwards">
              Bewegung, die gut tut
            </h1>
            <p className="hero-subtitle animate-fade-up fill-backwards delay-100">
              Strukturierte Trainingsstunden mit sicheren Alternativen für Knie-
              und Schulterprobleme.
            </p>

            {/* Stats as inline text (per Plan section 3) */}
            <p
              className="animate-fade-up fill-backwards delay-200"
              style={{
                color: "var(--color-text-muted)",
                fontSize: "1rem",
                marginBottom: "var(--space-8)",
              }}
            >
              {totalSessions} Stunden · {totalExercises} Übungen · 45 min
            </p>

            <div className="animate-fade-up fill-backwards delay-200">
              <a href="#kategorien" className="btn btn-primary btn-lg">
                Training starten
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid - directly below hero without section title */}
      <section id="kategorien" className="section section-categories">
        <div className="container">
          <div className="grid-categories">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/ordner/${category.slug}`}
                className="card card-hover category-card category-card-enhanced"
              >
                <div className="category-card-icon" aria-hidden="true">
                  {getCategoryIcon(category.slug)}
                </div>
                <h3 className="category-card-title">{category.title}</h3>
                <p className="category-card-description">
                  {category.description}
                </p>
                <div className="category-card-meta">
                  <span>
                    {category.sessions.length}{" "}
                    {category.sessions.length === 1 ? "Stunde" : "Stunden"}
                  </span>
                  <ArrowRightIcon />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: 45-Min Schema (kept - educational value) */}
      <section className="section section-schema">
        <div className="container">
          <header className="section-header">
            <h2 className="section-title">Das 45-Minuten-Schema</h2>
            <p className="section-subtitle">
              Jede Stunde folgt einer bewährten Struktur für sicheres und
              effektives Training.
            </p>
          </header>

          <div className="time-infographic">
            <div className="time-bar-container">
              <div className="time-bar-segment warmup">10 min</div>
              <div className="time-bar-segment main">15 min</div>
              <div className="time-bar-segment focus">15 min</div>
              <div className="time-bar-segment cooldown">10 min</div>
            </div>
            <div className="time-legend">
              <div className="time-legend-item">
                <span className="phase-dot phase-dot-warmup" />
                <span>
                  <strong>Aufwärmen</strong> – Mobilisation
                </span>
              </div>
              <div className="time-legend-item">
                <span className="phase-dot phase-dot-main" />
                <span>
                  <strong>Hauptteil</strong> – Kräftigung
                </span>
              </div>
              <div className="time-legend-item">
                <span className="phase-dot phase-dot-focus" />
                <span>
                  <strong>Schwerpunkt</strong> – Vertiefung
                </span>
              </div>
              <div className="time-legend-item">
                <span className="phase-dot phase-dot-cooldown" />
                <span>
                  <strong>Ausklang</strong> – Entspannung
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Features + CTA (combined per Plan section 3) */}
      <section className="section section-features">
        <div className="container">
          {/* Features as compact 3-icon row */}
          <div className="grid-features-compact">
            <div className="feature-compact">
              <span className="feature-compact-icon">🦵</span>
              <div>
                <strong>Knie-Alternativen</strong>
                <span className="feature-compact-desc">
                  Sichere Anpassungen bei Beschwerden
                </span>
              </div>
            </div>
            <div className="feature-compact">
              <span className="feature-compact-icon">💪</span>
              <div>
                <strong>Schulter-Alternativen</strong>
                <span className="feature-compact-desc">
                  Modifikationen für eingeschränkte Beweglichkeit
                </span>
              </div>
            </div>
            <div className="feature-compact">
              <span className="feature-compact-icon">📱</span>
              <div>
                <strong>Mobile-optimiert</strong>
                <span className="feature-compact-desc">
                  Perfekt lesbar während des Trainings
                </span>
              </div>
            </div>
          </div>

          {/* Integrated CTA */}
          <div
            className="card card-body-lg text-center"
            style={{
              backgroundColor: "var(--color-primary-soft)",
              marginTop: "var(--space-12)",
            }}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>Alle Übungen entdecken</h2>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Durchsuche die komplette Übungsbibliothek mit Filtern nach Phase
              und Schwierigkeit.
            </p>
            <Button to="/uebungen">Zur Übungsbibliothek</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
