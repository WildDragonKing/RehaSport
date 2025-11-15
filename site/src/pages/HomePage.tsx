import { Link } from "react-router-dom";

import { categories } from "../content/sessions";

function HomePage(): JSX.Element {
  return (
    <div className="container stack">
      <header className="page-header">
        <p className="page-eyebrow">Reader</p>
        <h1>RehaSport Reader</h1>
        <p className="page-lead">
          Der RehaSport Reader bringt vorbereitete RehaSport-Stunden direkt auf den Bildschirm. Statt nach
          Zetteln zu suchen, öffnest du die passende Einheit im Browser und folgst dem Ablauf Schritt für Schritt.
        </p>
      </header>

      <section className="info-card">
        <h2>Was du damit machen kannst</h2>
        <ul>
          <li>Du siehst alle Stunden übersichtlich sortiert nach Trainingsschwerpunkt.</li>
          <li>Jede Stunde beschreibt Aufwärmen, Hauptteil, Schwerpunkt und Ausklang in klarer Sprache.</li>
          <li>Hinweise zu Alternativen helfen dir, Übungen spontan anzupassen.</li>
        </ul>
      </section>

      <section className="info-card">
        <h2>Mitmachen</h2>
        <p>
          Hast du eine neue Idee für eine Stunde oder möchtest Feedback geben? Das Projekt lebt von gemeinsamer
          Weiterentwicklung. Auf GitHub findest du den Quellcode, kannst Ideen diskutieren und direkt neue Vorschläge als
          Issue einreichen.
        </p>
        <div className="cta-links" role="group" aria-label="Mitmachen">
          <a
            className="button button--secondary"
            href="https://github.com/buettgen/RehaSport"
            target="_blank"
            rel="noreferrer"
          >
            Zum GitHub-Projekt
          </a>
          <a
            className="button button--primary"
            href="https://github.com/buettgen/RehaSport/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            Idee als Issue einreichen
          </a>
        </div>
      </section>

      <div className="category-grid">
        {categories.map((category) => (
          <article key={category.slug} className="category-card">
            <div className="category-card__header">
              <h2>{category.title}</h2>
              <p className="category-card__description">{category.description}</p>
            </div>
            {category.focusTags.length > 0 ? (
              <ul className="tag-list" aria-label="Schwerpunkte">
                {category.focusTags.map((tag) => (
                  <li key={tag} className="tag">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="category-card__footer">
              <span className="category-card__meta">
                {category.sessions.length} {category.sessions.length === 1 ? "Stunde" : "Stunden"}
              </span>
              <Link className="button button--primary" to={`/ordner/${category.slug}`}>
                Ordner öffnen
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
