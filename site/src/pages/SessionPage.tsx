import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import { findExerciseSlugByTitle } from "../content/exercises";
import { getCategory, getSession } from "../content/sessions";

function SessionPage(): JSX.Element {
  const { categorySlug, sessionSlug } = useParams();
  const session = categorySlug && sessionSlug ? getSession(categorySlug, sessionSlug) : undefined;
  const category = categorySlug ? getCategory(categorySlug) : undefined;
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const exerciseRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  function getPhaseColor(phaseTitle: string): string {
    const title = phaseTitle.toLowerCase();
    if (title.includes("aufwärmen") || title.includes("phase 1")) return "phase-warmup";
    if (title.includes("hauptteil") || title.includes("phase 2")) return "phase-main";
    if (title.includes("schwerpunkt") || title.includes("phase 3")) return "phase-focus";
    if (title.includes("ausklang") || title.includes("phase 4")) return "phase-cooldown";
    return "";
  }

  function toggleExercise(exerciseKey: string): void {
    const isCurrentlyExpanded = expandedExercises.has(exerciseKey);

    // Haptic feedback for mobile devices
    if ("vibrate" in navigator && !isCurrentlyExpanded) {
      navigator.vibrate(10);
    }

    setExpandedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseKey)) {
        next.delete(exerciseKey);
      } else {
        next.add(exerciseKey);
      }
      return next;
    });

    // Auto-scroll to expanded exercise
    if (!isCurrentlyExpanded) {
      setTimeout(() => {
        const element = exerciseRefs.current.get(exerciseKey);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    }
  }

  function setExerciseRef(key: string, element: HTMLLIElement | null): void {
    if (element) {
      exerciseRefs.current.set(key, element);
    } else {
      exerciseRefs.current.delete(key);
    }
  }

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

      {session.phases.length > 0 ? (
        <div className="session-phases">
          {session.phases.map((phase, phaseIndex) => {
            const phaseColorClass = getPhaseColor(phase.title);
            return (
              <section key={phase.title} className={`session-phase ${phaseColorClass}`}>
                <header className="session-phase__header">
                  <h2 className="session-phase__title">{phase.title}</h2>
                  {phase.description ? <p className="session-phase__description">{phase.description}</p> : null}
                </header>

                <ol className="exercise-list" aria-label={`Übungen: ${phase.title}`}>
                  {phase.exercises.map((exercise, exerciseIndex) => {
                    const exerciseKey = `${phaseIndex}-${exerciseIndex}`;
                    const isExpanded = expandedExercises.has(exerciseKey);
                    const exerciseSlug = findExerciseSlugByTitle(exercise.title);
                    const primaryDetail = exercise.details.find((d) => d.label === "Durchführung");
                    const otherDetails = exercise.details.filter((d) => d.label !== "Durchführung");

                    // Extract alternative indicators
                    const kneeDetail = otherDetails.find((d) => d.label === "Knie-Alternative");
                    const shoulderDetail = otherDetails.find((d) => d.label === "Schulter-Alternative");
                    const hasAlternatives = kneeDetail || shoulderDetail;

                    return (
                      <li key={exerciseKey} className="exercise exercise--compact" ref={(el) => setExerciseRef(exerciseKey, el)}>
                        <button
                          type="button"
                          className="exercise__toggle"
                          onClick={() => toggleExercise(exerciseKey)}
                          aria-expanded={isExpanded}
                          aria-label={`${exercise.title}, ${primaryDetail?.value ?? ""}, ${isExpanded ? "Details ausblenden" : "Details anzeigen"}`}
                        >
                          <span className="exercise__number" aria-hidden="true">
                            {exerciseIndex + 1}
                          </span>
                          <div className="exercise__main">
                            <div className="exercise__title-row">
                              <strong className="exercise__title">{exercise.title}</strong>
                              {hasAlternatives ? (
                                <span className="exercise__alternatives" aria-label="Alternativen verfügbar">
                                  {kneeDetail ? (
                                    <span className="alternative-icon alternative-icon--knee" title="Knie-Alternative">
                                      K
                                    </span>
                                  ) : null}
                                  {shoulderDetail ? (
                                    <span className="alternative-icon alternative-icon--shoulder" title="Schulter-Alternative">
                                      S
                                    </span>
                                  ) : null}
                                </span>
                              ) : null}
                            </div>
                            {primaryDetail ? <span className="exercise__primary">{primaryDetail.value}</span> : null}
                          </div>
                          <span className="exercise__icon" aria-hidden="true">
                            {isExpanded ? "−" : "+"}
                          </span>
                        </button>

                        {isExpanded ? (
                          <div className="exercise__expanded">
                            {otherDetails.length > 0 ? (
                              <dl className="exercise__details">
                                {otherDetails.map((detail) => (
                                  <div key={`${exerciseKey}-${detail.label}`} className={detail.label.includes("Alternative") ? "detail--alternative" : ""}>
                                    <dt>{detail.label}</dt>
                                    <dd>{detail.value}</dd>
                                  </div>
                                ))}
                              </dl>
                            ) : null}
                            {exerciseSlug ? (
                              <Link className="exercise__link" to={`/uebungen/${exerciseSlug}`}>
                                Zur Übung
                              </Link>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      ) : (
        <p>Keine Übungen gefunden.</p>
      )}
    </div>
  );
}

export default SessionPage;
