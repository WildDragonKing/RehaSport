import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import StarRating from "../components/ui/StarRating";
import { useContent } from "../contexts/ContentContext";
import { useRatings, type RatingSummary } from "../hooks/useRatings";

function ChevronLeftIcon(): JSX.Element {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(): JSX.Element {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function getPhaseIndex(phaseTitle: string): number {
  const title = phaseTitle.toLowerCase();
  if (title.includes("aufwärmen") || title.includes("phase 1")) return 0;
  if (title.includes("hauptteil") || title.includes("phase 2")) return 1;
  if (title.includes("schwerpunkt") || title.includes("phase 3")) return 2;
  if (title.includes("ausklang") || title.includes("phase 4")) return 3;
  return -1;
}

function roleLabel(role?: "mandatory" | "optional_buffer" | "progression"): {
  text: string;
  className: string;
} {
  if (role === "mandatory") {
    return { text: "Pflicht", className: "badge badge-knee" };
  }
  if (role === "optional_buffer") {
    return { text: "Puffer", className: "badge badge-shoulder" };
  }
  if (role === "progression") {
    return { text: "Steigerung", className: "badge" };
  }
  return { text: "Übung", className: "badge" };
}

function SessionPage(): JSX.Element {
  const { categorySlug, sessionSlug } = useParams();
  const { getSession, getCategory, findExerciseByTitle } = useContent();
  const session =
    categorySlug && sessionSlug
      ? getSession(categorySlug, sessionSlug)
      : undefined;
  const category = categorySlug ? getCategory(categorySlug) : undefined;

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const exerciseRefs = useRef<Map<string, HTMLElement>>(new Map());
  const { getRating, setRating, getSummary } = useRatings();
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(
    null,
  );

  const sessionId =
    categorySlug && sessionSlug ? `${categorySlug}/${sessionSlug}` : null;
  const currentRating = sessionId ? getRating(sessionId, "session") : null;

  useEffect(() => {
    if (sessionId) {
      getSummary(sessionId, "session").then(setRatingSummary);
    }
  }, [sessionId, getSummary]);

  const handleRate = async (rating: number) => {
    if (sessionId) {
      await setRating(sessionId, "session", rating);
      const summary = await getSummary(sessionId, "session");
      setRatingSummary(summary);
    }
  };

  const allExercises =
    session?.phases.flatMap((phase, phaseIndex) =>
      phase.exercises.map((exercise, exerciseIndex) => ({
        exercise,
        key: `${phaseIndex}-${exerciseIndex}`,
        phaseTitle: phase.title,
      })),
    ) ?? [];

  const goToExercise = useCallback(
    (index: number) => {
      if (index >= 0 && index < allExercises.length) {
        setCurrentExerciseIndex(index);
        const exerciseKey = allExercises[index].key;
        const element = exerciseRefs.current.get(exerciseKey);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if ("vibrate" in navigator) {
          navigator.vibrate(10);
        }
      }
    },
    [allExercises],
  );

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

  function setExerciseRef(key: string, element: HTMLElement | null): void {
    if (element) {
      exerciseRefs.current.set(key, element);
    } else {
      exerciseRefs.current.delete(key);
    }
  }

  if (!session || !category) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h1 className="empty-state-title">Stunde nicht gefunden</h1>
          <p className="empty-state-description">
            Die angeforderte Trainingsstunde existiert nicht.
          </p>
          <Button to="/" variant="secondary">
            Zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  const currentExercise = allExercises[currentExerciseIndex];
  const currentPhaseIndex = currentExercise
    ? getPhaseIndex(currentExercise.phaseTitle)
    : 0;

  return (
    <div className="container stack session-page-content">
      <nav className="breadcrumb" aria-label="Navigation">
        <Link to="/" className="breadcrumb-link">
          Start
        </Link>
        <span className="breadcrumb-separator">/</span>
        <Link to={`/ordner/${category.slug}`} className="breadcrumb-link">
          {category.title}
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{session.title}</span>
      </nav>

      <header className="stack-sm">
        <h1>{session.title}</h1>
        {session.description && (
          <p className="text-muted" style={{ fontSize: "1.125rem" }}>
            {session.description}
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginTop: "0.5rem",
          }}
        >
          {session.duration && (
            <div>
              <span
                className="text-light"
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Dauer
              </span>
              <p style={{ fontWeight: 500 }}>{session.duration}</p>
            </div>
          )}
          {session.focus && (
            <div>
              <span
                className="text-light"
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Fokus
              </span>
              <p style={{ fontWeight: 500 }}>{session.focus}</p>
            </div>
          )}
        </div>
      </header>

      {session.phases.length > 0 && (
        <div className="phase-timeline">
          <div
            className={`phase-timeline-segment warmup ${currentPhaseIndex === 0 ? "active" : ""}`}
          />
          <div
            className={`phase-timeline-segment main ${currentPhaseIndex === 1 ? "active" : ""}`}
          />
          <div
            className={`phase-timeline-segment focus ${currentPhaseIndex === 2 ? "active" : ""}`}
          />
          <div
            className={`phase-timeline-segment cooldown ${currentPhaseIndex === 3 ? "active" : ""}`}
          />
        </div>
      )}

      {session.phases.length > 0 && allExercises.length > 0 && (
        <div className="session-controls-wrapper">
          <div className="session-controls-row">
            <span className="session-exercise-counter">
              {currentExerciseIndex + 1} / {allExercises.length}
            </span>
          </div>
        </div>
      )}

      {session.phases.length > 0 ? (
        <div className="exercise-cards-teilnehmer">
          {allExercises.map(({ exercise, key, phaseTitle }, globalIndex) => {
            const isActive = globalIndex === currentExerciseIndex;
            const foundExercise = exercise.slug
              ? { slug: exercise.slug }
              : findExerciseByTitle(exercise.title);
            const role = roleLabel(exercise.role);

            return (
              <article
                key={key}
                ref={(el) => setExerciseRef(key, el)}
                className={`exercise-card-large ${isActive ? "active" : ""}`}
                onClick={() => setCurrentExerciseIndex(globalIndex)}
              >
                <div className="exercise-card-large-header">
                  <span className="exercise-card-large-number">
                    {globalIndex + 1}
                  </span>
                  <div>
                    <h3 className="exercise-card-large-title">{exercise.title}</h3>
                    <p className="exercise-card-large-phase">{phaseTitle}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <span className={role.className}>{role.text}</span>
                  {exercise.estMinutes && (
                    <span className="badge">{exercise.estMinutes} Min</span>
                  )}
                </div>

                <div className="exercise-card-large-content">
                  {exercise.details.map((detail, index) => (
                    <div
                      key={`${detail.label}-${index}`}
                      className="exercise-card-large-detail"
                    >
                      <div className="exercise-card-large-detail-label">
                        {detail.label}
                      </div>
                      <div className="exercise-card-large-detail-value">
                        {detail.value}
                      </div>
                    </div>
                  ))}

                  {foundExercise && (
                    <div style={{ marginTop: "1rem" }}>
                      <Button
                        to={`/uebungen/${foundExercise.slug}`}
                        variant="ghost"
                        size="sm"
                      >
                        Zur vollständigen Übung →
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-muted">Keine Übungen in dieser Stunde gefunden.</p>
      )}

      <section className="rating-card">
        <div className="rating-card-header">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill="currentColor"
              style={{ color: "var(--color-rating-star)" }}
            />
          </svg>
          <span className="rating-card-title">
            Wie hat Ihnen diese Stunde gefallen?
          </span>
        </div>
        <p className="rating-card-subtitle">
          Gut bewertete Stunden dienen als Inspiration für neue
          Trainingseinheiten.
        </p>
        <StarRating rating={currentRating} onRate={handleRate} size="lg" />
        {ratingSummary && ratingSummary.totalRatings > 0 && (
          <p className="text-sm text-sage-500 mt-3">
            Durchschnitt: {ratingSummary.averageRating.toFixed(1)} ⭐ (
            {ratingSummary.totalRatings}{" "}
            {ratingSummary.totalRatings === 1 ? "Bewertung" : "Bewertungen"})
          </p>
        )}
      </section>

      {allExercises.length > 1 && (
        <div className="bottom-nav">
          <div className="bottom-nav-content">
            <Button
              variant="ghost"
              icon
              onClick={() => goToExercise(currentExerciseIndex - 1)}
              disabled={currentExerciseIndex === 0}
              aria-label="Vorherige Übung"
            >
              <ChevronLeftIcon />
            </Button>

            <div className="bottom-nav-center">
              <span
                className={`bottom-nav-dot ${currentPhaseIndex === 0 ? "active" : ""}`}
                style={{ backgroundColor: "var(--color-phase-warmup)" }}
              />
              <span
                className={`bottom-nav-dot ${currentPhaseIndex === 1 ? "active" : ""}`}
                style={{ backgroundColor: "var(--color-phase-main)" }}
              />
              <span
                className={`bottom-nav-dot ${currentPhaseIndex === 2 ? "active" : ""}`}
                style={{ backgroundColor: "var(--color-phase-focus)" }}
              />
              <span
                className={`bottom-nav-dot ${currentPhaseIndex === 3 ? "active" : ""}`}
                style={{ backgroundColor: "var(--color-phase-cooldown)" }}
              />
            </div>

            <Button
              variant="ghost"
              icon
              onClick={() => goToExercise(currentExerciseIndex + 1)}
              disabled={currentExerciseIndex === allExercises.length - 1}
              aria-label="Nächste Übung"
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionPage;
