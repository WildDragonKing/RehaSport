import { Link } from "react-router-dom";

import Button from "../components/ui/Button";
import { exercises } from "../content/exercises";

function ExercisesPage(): JSX.Element {
  return (
    <div className="container stack">
      <header className="page-header">
        <p className="page-eyebrow">Übungen</p>
        <h1>Übungen entdecken</h1>
        <p className="page-lead">
          Alle dokumentierten Übungen im Überblick. Jede Karte zeigt die wichtigsten Rahmendaten und führt zur detaillierten
          Beschreibung mit Alternativen und Hinweisen.
        </p>
      </header>

      <ul className="exercise-catalog" aria-label="Übungsübersicht">
        {exercises.map((exercise) => (
          <li key={exercise.slug} className="exercise-card">
            <article className="exercise-card__inner">
              <header className="exercise-card__header">
                <h2>
                  <Link to={`/uebungen/${exercise.slug}`}>{exercise.title}</Link>
                </h2>
                {exercise.summary ? <p className="exercise-card__summary">{exercise.summary}</p> : null}
              </header>
              <dl className="exercise-card__meta">
                {exercise.area ? (
                  <div>
                    <dt>Bereich</dt>
                    <dd>{exercise.area}</dd>
                  </div>
                ) : null}
                {exercise.focus ? (
                  <div>
                    <dt>Schwerpunkt</dt>
                    <dd>{exercise.focus}</dd>
                  </div>
                ) : null}
                {exercise.duration ? (
                  <div>
                    <dt>Dauer</dt>
                    <dd>{exercise.duration}</dd>
                  </div>
                ) : null}
                {exercise.difficulty ? (
                  <div>
                    <dt>Schwierigkeit</dt>
                    <dd>{exercise.difficulty}</dd>
                  </div>
                ) : null}
              </dl>
              {exercise.tags.length > 0 ? (
                <ul className="tag-list" aria-label="Tags">
                  {exercise.tags.map((tag) => (
                    <li key={`${exercise.slug}-${tag}`} className="tag">
                      #{tag}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="exercise-card__footer">
                <Button to={`/uebungen/${exercise.slug}`} variant="primary">
                  Übung ansehen
                </Button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExercisesPage;
