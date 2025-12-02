import { Link } from "react-router-dom";

import { exercises } from "../content/exercises";
import { categories } from "../content/sessions";

function HomePage(): JSX.Element {
  const totalSessions = categories.reduce((acc, cat) => acc + cat.sessions.length, 0);
  const totalExercises = exercises.length;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero__content">
            <h1 className="hero__title">RehaSport Reader</h1>
            <p className="hero__subtitle">
              Strukturierte Trainingsstunden mit Alternativen für Knie- und Schulterprobleme.
            </p>
            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-number">{totalSessions}</span>
                <span className="hero__stat-label">Stunden</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-number">{totalExercises}</span>
                <span className="hero__stat-label">Übungen</span>
              </div>
            </div>
            <div className="hero__actions">
              <Link className="button button--primary" to="/uebungen">
                Alle Übungen
              </Link>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__schema">
              <div className="schema-item schema-item--warmup">
                <span className="schema-item__time">10</span>
                <span className="schema-item__label">Aufwärmen</span>
              </div>
              <div className="schema-item schema-item--main">
                <span className="schema-item__time">15</span>
                <span className="schema-item__label">Hauptteil</span>
              </div>
              <div className="schema-item schema-item--focus">
                <span className="schema-item__time">15</span>
                <span className="schema-item__label">Schwerpunkt</span>
              </div>
              <div className="schema-item schema-item--cooldown">
                <span className="schema-item__time">10</span>
                <span className="schema-item__label">Ausklang</span>
              </div>
            </div>
            <p className="hero__schema-label">45-Minuten-Schema</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <header className="section-header">
            <h2>Kategorien</h2>
            <p>Wähle eine Kategorie für die verfügbaren Stunden</p>
          </header>

          <div className="category-grid">
            {categories.map((category) => (
              <Link key={category.slug} to={`/ordner/${category.slug}`} className="category-card">
                <div className="category-card__icon" aria-hidden="true">
                  {getCategoryIcon(category.slug)}
                </div>
                <div className="category-card__content">
                  <h3 className="category-card__title">{category.title}</h3>
                  <p className="category-card__description">{category.description}</p>
                </div>
                <div className="category-card__footer">
                  <span className="category-card__meta">
                    {category.sessions.length} {category.sessions.length === 1 ? "Stunde" : "Stunden"}
                  </span>
                  <span className="category-card__arrow" aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">🦵</div>
              <h3>Knie-Alternativen</h3>
              <p>Sichere Anpassungen für Knieprobleme</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">💪</div>
              <h3>Schulter-Alternativen</h3>
              <p>Modifikationen für Schulterprobleme</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">⏱️</div>
              <h3>45-Min-Einheiten</h3>
              <p>Strukturiert im 10-15-15-10 Schema</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contribute Section */}
      <section className="contribute-section">
        <div className="container">
          <div className="contribute-card">
            <div className="contribute-card__content">
              <h2>Mitmachen</h2>
              <p>
                Das Projekt lebt von gemeinsamer Weiterentwicklung.
              </p>
            </div>
            <div className="contribute-card__actions">
              <a
                className="button button--secondary"
                href="https://github.com/WildDragonKing/RehaSport"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <a
                className="button button--primary"
                href="https://github.com/WildDragonKing/RehaSport/issues"
                target="_blank"
                rel="noreferrer"
              >
                Idee einreichen
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    ruecken: "🏋️",
    balance: "⚖️",
    schulter: "💪",
    "herz-kreislauf": "❤️",
    ganzkoerper: "🧘"
  };
  return icons[slug] || "📁";
}

export default HomePage;
