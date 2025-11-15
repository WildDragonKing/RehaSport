import { Link, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import { getCategory } from "../content/sessions";

function CategoryPage(): JSX.Element {
  const { categorySlug } = useParams();
  const category = categorySlug ? getCategory(categorySlug) : undefined;

  if (!category) {
    return (
      <div className="container stack">
        <header className="page-header">
          <h1>Ordner nicht gefunden</h1>
          <p className="page-lead">Der angeforderte Ordner konnte nicht geladen werden.</p>
        </header>
        <Button to="/" variant="secondary">
          Zur Übersicht
        </Button>
      </div>
    );
  }

  return (
    <div className="container stack">
      <nav className="breadcrumb" aria-label="Navigation">
        <ol>
          <li>
            <Link to="/">Ordner</Link>
          </li>
          <li aria-current="page">{category.title}</li>
        </ol>
      </nav>

      <header className="page-header">
        <p className="page-eyebrow">Ordner</p>
        <h1>{category.title}</h1>
        {category.description ? <p className="page-lead">{category.description}</p> : null}
        {category.focusTags.length > 0 ? (
          <ul className="tag-list" aria-label="Schwerpunkte">
            {category.focusTags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <section className="session-grid" aria-label={`Stunden im Ordner ${category.title}`}>
        {category.sessions.map((session) => (
          <article key={session.slug} className="session-card">
            <div className="session-card__header">
              <h2>
                <Link to={`/ordner/${category.slug}/${session.slug}`}>{session.title}</Link>
              </h2>
            </div>
            {session.description ? (
              <p className="session-card__description">{session.description}</p>
            ) : null}
            <dl className="session-card__meta">
              {session.duration ? (
                <div>
                  <dt>Dauer</dt>
                  <dd>{session.duration}</dd>
                </div>
              ) : null}
              {session.focus ? (
                <div>
                  <dt>Fokus</dt>
                  <dd>{session.focus}</dd>
                </div>
              ) : null}
            </dl>
            <div className="session-card__footer">
              <Button to={`/ordner/${category.slug}/${session.slug}`} variant="primary">
                Stunde öffnen
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default CategoryPage;
