import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import { findExerciseSlugByTitle } from "../content/exercises";
import { getCategory, getSession } from "../content/sessions";

function SessionPage(): JSX.Element {
  const { categorySlug, sessionSlug } = useParams();
  const session = categorySlug && sessionSlug ? getSession(categorySlug, sessionSlug) : undefined;
  const category = categorySlug ? getCategory(categorySlug) : undefined;
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [sessionSlug]);

  const safeIndex = session
    ? Math.min(activeIndex, Math.max(0, session.exercises.length - 1))
    : 0;

  if (!session || !category) {
    return (
      <div className="container stack">
        <header className="page-header">
          <h1>Stunde nicht gefunden</h1>
          <p className="page-lead">Die angeforderte Stunde existiert nicht oder konnte nicht geladen werden.</p>
        </header>
        <Button to="/" variant="secondary">
          Zur Übersicht
        </Button>
      </div>
    );
  }

  const exercises = session.exercises;
  const activeExercise = exercises[safeIndex];

  function handlePrevious(): void {
    setActiveIndex((index) => Math.max(0, index - 1));
  }

  function handleNext(): void {
    setActiveIndex((index) => Math.min(exercises.length - 1, index + 1));
  }

  const totalExercises = exercises.length;
  const activePosition = totalExercises > 0 ? `${safeIndex + 1} / ${totalExercises}` : undefined;

  return (
    <div className="container stack">
      <nav className="breadcrumb" aria-label="Navigation">
        <ol>
          <li>
            <Link to="/">Ordner</Link>
          </li>
          <li>
            <Link to={`/ordner/${category.slug}`}>{category.title}</Link>
          </li>
          <li aria-current="page">{session.title}</li>
        </ol>
      </nav>

      <header className="page-header">
        <p className="page-eyebrow">Stunde</p>
        <h1>{session.title}</h1>
        {session.description ? <p className="page-lead">{session.description}</p> : null}
        <dl className="session-info">
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
      </header>

      <section className="exercise-controls" aria-label="Steuerung">
        <div className="exercise-status">
          <span className="exercise-status__label">Aktive Übung</span>
          <div className="exercise-status__content">
            {activePosition ? <span className="exercise-status__position">{activePosition}</span> : null}
            <strong className="exercise-status__title">{activeExercise?.title ?? "-"}</strong>
          </div>
        </div>
        <div className="exercise-buttons">
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrevious}
            disabled={safeIndex === 0 || exercises.length === 0}
            aria-label="Vorherige Übung"
          >
            Zurück
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            disabled={exercises.length === 0 || safeIndex === exercises.length - 1}
            aria-label="Nächste Übung"
          >
            Weiter
          </Button>
        </div>
      </section>

      <ol className="exercise-list" aria-label="Übungsablauf">
        {exercises.map((exercise, index) => {
          const isActive = index === safeIndex;
          const exerciseSlug = findExerciseSlugByTitle(exercise.title);
          return (
            <li key={exercise.title} className={isActive ? "exercise exercise--active" : "exercise"}>
              <div className="exercise__header">
                <button
                  type="button"
                  className="exercise__selector"
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={isActive}
                >
                  <span className="exercise__number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="exercise__title">{exercise.title}</span>
                  {isActive ? <span className="exercise__badge">Aktiv</span> : null}
                </button>
                {exerciseSlug ? (
                  <Link className="exercise__link" to={`/uebungen/${exerciseSlug}`}>
                    Zur Übung
                  </Link>
                ) : null}
              </div>
              {exercise.details.length > 0 ? (
                <dl className="exercise__details">
                  {exercise.details.map((detail) => (
                    <div key={`${exercise.title}-${detail.label}`}>
                      <dt>{detail.label}</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default SessionPage;
