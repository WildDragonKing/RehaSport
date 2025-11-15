import { Link } from "react-router-dom";

import { categories } from "../content/sessions";

function HomePage(): JSX.Element {
  return (
    <div className="container stack">
      <header className="page-header">
        <p className="page-eyebrow">Reader</p>
        <h1>Stunden-Ordner</h1>
        <p className="page-lead">
          Wähle einen Ordner, um die vorbereiteten RehaSport-Stunden zu öffnen. Jede Stunde stammt aus
          einer Markdown-Datei und ist direkt für den Ablauf im Training aufbereitet.
        </p>
      </header>

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
