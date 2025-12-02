import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import { findExerciseSlugByTitle } from "../content/exercises";
import { getCategory, getSession } from "../content/sessions";

function SessionPage(): JSX.Element {
  const { categorySlug, sessionSlug } = useParams();
  const session = categorySlug && sessionSlug ? getSession(categorySlug, sessionSlug) : undefined;
  const category = categorySlug ? getCategory(categorySlug) : undefined;
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const exerciseRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  // Flatten exercises for navigation
  const allExercises = session?.phases.flatMap((phase, phaseIndex) =>
    phase.exercises.map((exercise, exerciseIndex) => ({
      exercise,
      key: `${phaseIndex}-${exerciseIndex}`,
      phaseTitle: phase.title,
      phaseIndex,
      exerciseIndex
    }))
  ) ?? [];

  const allExerciseKeys = allExercises.map(e => e.key);
  const allExpanded = allExerciseKeys.length > 0 && allExerciseKeys.every(key => expandedExercises.has(key));

  // Navigate to specific exercise
  const goToExercise = useCallback((index: number) => {
    if (index >= 0 && index < allExercises.length) {
      setCurrentExerciseIndex(index);
      const exerciseKey = allExercises[index].key;

      // Expand the target exercise
      setExpandedExercises(prev => {
        const next = new Set(prev);
        next.add(exerciseKey);
        return next;
      });

      // Scroll to exercise
      setTimeout(() => {
        const element = exerciseRefs.current.get(exerciseKey);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);

      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }
    }
  }, [allExercises]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToExercise(currentExerciseIndex + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToExercise(currentExerciseIndex - 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentExerciseIndex, goToExercise]);

  function toggleAll(): void {
    if (allExpanded) {
      setExpandedExercises(new Set());
    } else {
      setExpandedExercises(new Set(allExerciseKeys));
    }
  }

  function getPhaseColor(phaseTitle: string): string {
    const title = phaseTitle.toLowerCase();
    if (title.includes("aufwärmen") || title.includes("phase 1")) return "phase-warmup";
    if (title.includes("hauptteil") || title.includes("phase 2")) return "phase-main";
    if (title.includes("schwerpunkt") || title.includes("phase 3")) return "phase-focus";
    if (title.includes("ausklang") || title.includes("phase 4")) return "phase-cooldown";
    return "";
  }

  function toggleExercise(exerciseKey: string, globalIndex: number): void {
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

    // Update current exercise index
    setCurrentExerciseIndex(globalIndex);

    // Auto-scroll to expanded exercise
    if (!isCurrentlyExpanded) {
      setTimeout(() => {
        const element = exerciseRefs.current.get(exerciseKey);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
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
          <p className="page-lead">Die angeforderte Stunde existiert nicht.</p>
        </header>
        <Button to="/" variant="secondary">
          Zur Übersicht
        </Button>
      </div>
    );
  }

  const currentExercise = allExercises[currentExerciseIndex];

  return (
    <div className="container stack">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Navigation">
        <ol>
          <li>
            <Link to="/">Start</Link>
          </li>
          <li>
            <Link to={`/ordner/${category.slug}`}>{category.title}</Link>
          </li>
          <li aria-current="page">{session.title}</li>
        </ol>
      </nav>

      {/* Page Header */}
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

      {/* Session Controls */}
      {session.phases.length > 0 && allExerciseKeys.length > 0 ? (
        <div className="session-controls">
          <button
            type="button"
            className="button button--secondary"
            onClick={toggleAll}
            aria-label={allExpanded ? "Alle zuklappen" : "Alle aufklappen"}
          >
            {allExpanded ? "Alle zuklappen" : "Alle aufklappen"}
          </button>
          <span className="session-controls__info">
            {currentExerciseIndex + 1} / {allExercises.length}
          </span>
        </div>
      ) : null}

      {/* Quick Navigation for Mobile */}
      {allExercises.length > 1 ? (
        <div className="session-nav">
          <button
            type="button"
            className="session-nav__btn"
            onClick={() => goToExercise(currentExerciseIndex - 1)}
            disabled={currentExerciseIndex === 0}
            aria-label="Vorherige Übung"
          >
            ←
          </button>
          <div className="session-nav__current">
            <span className="session-nav__phase">{currentExercise?.phaseTitle}</span>
            <span className="session-nav__title">{currentExercise?.exercise.title}</span>
          </div>
          <button
            type="button"
            className="session-nav__btn"
            onClick={() => goToExercise(currentExerciseIndex + 1)}
            disabled={currentExerciseIndex === allExercises.length - 1}
            aria-label="Nächste Übung"
          >
            →
          </button>
        </div>
      ) : null}

      {/* Session Phases */}
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
                    const globalIndex = allExercises.findIndex(e => e.key === exerciseKey);
                    const isExpanded = expandedExercises.has(exerciseKey);
                    const isActive = globalIndex === currentExerciseIndex;
                    const exerciseSlug = findExerciseSlugByTitle(exercise.title);
                    const primaryDetail = exercise.details.find((d) => d.label === "Durchführung");
                    const otherDetails = exercise.details.filter((d) => d.label !== "Durchführung");

                    // Extract alternative indicators
                    const kneeDetail = otherDetails.find((d) => d.label === "Knie-Alternative");
                    const shoulderDetail = otherDetails.find((d) => d.label === "Schulter-Alternative");
                    const hasAlternatives = kneeDetail || shoulderDetail;

                    return (
                      <li
                        key={exerciseKey}
                        className={`exercise exercise--compact ${isActive ? "exercise--active" : ""}`}
                        ref={(el) => setExerciseRef(exerciseKey, el)}
                      >
                        <button
                          type="button"
                          className="exercise__toggle"
                          onClick={() => toggleExercise(exerciseKey, globalIndex)}
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
                                Zur Übung →
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
