import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import StarRating from "../components/ui/StarRating";
import { useContent } from "../contexts/ContentContext";
import { useRatings, type RatingSummary } from "../hooks/useRatings";

// Icons
function ChevronDownIcon(): JSX.Element {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

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

function SessionPage(): JSX.Element {
  const { categorySlug, sessionSlug } = useParams();
  const { getSession, getCategory, findExerciseByTitle } = useContent();
  const session =
    categorySlug && sessionSlug
      ? getSession(categorySlug, sessionSlug)
      : undefined;
  const category = categorySlug ? getCategory(categorySlug) : undefined;
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(
    new Set(),
  );
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"trainer" | "teilnehmer">("trainer");
  const [isMobile, setIsMobile] = useState(false);
  const exerciseRefs = useRef<Map<string, HTMLLIElement | HTMLElement>>(
    new Map(),
  );
  const { getRating, setRating, getSummary } = useRatings();
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(
    null,
  );

  const sessionId =
    categorySlug && sessionSlug ? `${categorySlug}/${sessionSlug}` : null;
  const currentRating = sessionId ? getRating(sessionId, "session") : null;

  // Load rating summary
  useEffect(() => {
    if (sessionId) {
      getSummary(sessionId, "session").then(setRatingSummary);
    }
  }, [sessionId, getSummary]);

  // Load saved view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sessionViewMode");
    if (saved === "teilnehmer") {
      setViewMode("teilnehmer");
    }
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 639px)").matches);
    };
    checkMobile();

    const mobileQuery = window.matchMedia("(max-width: 639px)");
    mobileQuery.addEventListener("change", checkMobile);
    return () => mobileQuery.removeEventListener("change", checkMobile);
  }, []);

  const handleViewModeChange = (mode: "trainer" | "teilnehmer") => {
    setViewMode(mode);
    localStorage.setItem("sessionViewMode", mode);
  };

  const handleRate = async (rating: number) => {
    if (sessionId) {
      await setRating(sessionId, "session", rating);
      // Refresh summary after rating
      const summary = await getSummary(sessionId, "session");
      setRatingSummary(summary);
    }
  };

  // Flatten exercises for navigation
  const allExercises =
    session?.phases.flatMap((phase, phaseIndex) =>
      phase.exercises.map((exercise, exerciseIndex) => ({
        exercise,
        key: `${phaseIndex}-${exerciseIndex}`,
        phaseTitle: phase.title,
        phaseIndex,
        exerciseIndex,
      })),
    ) ?? [];

  const allExerciseKeys = allExercises.map((e) => e.key);
  const allExpanded =
    allExerciseKeys.length > 0 &&
    allExerciseKeys.every((key) => expandedExercises.has(key));

  // Navigate to specific exercise
  const goToExercise = useCallback(
    (index: number) => {
      if (index >= 0 && index < allExercises.length) {
        setCurrentExerciseIndex(index);
        const exerciseKey = allExercises[index].key;

        setExpandedExercises((prev) => {
          const next = new Set(prev);
          next.add(exerciseKey);
          return next;
        });

        setTimeout(() => {
          const element = exerciseRefs.current.get(exerciseKey);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);

        if ("vibrate" in navigator) {
          navigator.vibrate(10);
        }
      }
    },
    [allExercises],
  );

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

  function getPhaseColorClass(phaseTitle: string): string {
    const title = phaseTitle.toLowerCase();
    if (title.includes("aufwärmen") || title.includes("phase 1"))
      return "phase-warmup";
    if (title.includes("hauptteil") || title.includes("phase 2"))
      return "phase-main";
    if (title.includes("schwerpunkt") || title.includes("phase 3"))
      return "phase-focus";
    if (title.includes("ausklang") || title.includes("phase 4"))
      return "phase-cooldown";
    return "";
  }

  function getPhaseIndex(phaseTitle: string): number {
    const title = phaseTitle.toLowerCase();
    if (title.includes("aufwärmen") || title.includes("phase 1")) return 0;
    if (title.includes("hauptteil") || title.includes("phase 2")) return 1;
    if (title.includes("schwerpunkt") || title.includes("phase 3")) return 2;
    if (title.includes("ausklang") || title.includes("phase 4")) return 3;
    return -1;
  }

  function toggleExercise(exerciseKey: string, globalIndex: number): void {
    const isCurrentlyExpanded = expandedExercises.has(exerciseKey);

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

    setCurrentExerciseIndex(globalIndex);

    if (!isCurrentlyExpanded) {
      setTimeout(() => {
        const element = exerciseRefs.current.get(exerciseKey);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }

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
    <div
      className={`container stack session-page-content ${viewMode === "teilnehmer" ? "session-teilnehmer-mode" : ""}`}
    >
      {/* Breadcrumb */}
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

      {/* Page Header */}
      <header className="stack-sm">
        <h1>{session.title}</h1>
        {session.description && (
          <p className="text-muted" style={{ fontSize: "1.125rem" }}>
            {session.description}
          </p>
        )}

        {/* Meta */}
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

      {/* Phase Timeline */}
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

      {/* Session Controls + Mode Toggle */}
      {session.phases.length > 0 && allExerciseKeys.length > 0 && (
        <div className="session-controls-wrapper">
          <div className="session-controls-row">
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              {allExpanded ? "Alle zuklappen" : "Alle aufklappen"}
            </Button>
            <span className="session-exercise-counter">
              {currentExerciseIndex + 1} / {allExercises.length}
            </span>
          </div>

          <div className="session-mode-toggle">
            <button
              type="button"
              className={`mode-toggle-btn ${viewMode === "trainer" ? "active" : ""}`}
              onClick={() => handleViewModeChange("trainer")}
            >
              Trainer
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${viewMode === "teilnehmer" ? "active" : ""}`}
              onClick={() => handleViewModeChange("teilnehmer")}
            >
              Teilnehmer
            </button>
          </div>
        </div>
      )}

      {/* Session Phases */}
      {session.phases.length > 0 ? (
        viewMode === "trainer" ? (
          // Trainer Mode: Akkordeon-Layout
          isMobile ? (
            // Mobile: Flache Liste ohne Phase-Container
            <div className="accordion trainer-mobile-flat">
              {allExercises.map(
                (
                  { exercise, key, phaseTitle, phaseIndex, exerciseIndex },
                  globalIndex,
                ) => {
                  const isExpanded = expandedExercises.has(key);
                  const isActive = globalIndex === currentExerciseIndex;
                  const foundExercise = findExerciseByTitle(exercise.title);
                  const exerciseSlug = foundExercise?.slug;
                  const primaryDetail = exercise.details.find(
                    (d) => d.label === "Durchführung",
                  );
                  const otherDetails = exercise.details.filter(
                    (d) => d.label !== "Durchführung",
                  );
                  const kneeDetail = otherDetails.find(
                    (d) => d.label === "Knie-Alternative",
                  );
                  const shoulderDetail = otherDetails.find(
                    (d) => d.label === "Schulter-Alternative",
                  );
                  const phaseColorClass = getPhaseColorClass(phaseTitle);

                  // Show phase header before first exercise of each phase
                  const isFirstInPhase =
                    globalIndex === 0 ||
                    allExercises[globalIndex - 1].phaseIndex !== phaseIndex;

                  return (
                    <div key={key}>
                      {isFirstInPhase && (
                        <div
                          className={`trainer-mobile-phase-label ${phaseColorClass}`}
                        >
                          {phaseTitle}
                        </div>
                      )}
                      <div
                        ref={(el) => setExerciseRef(key, el)}
                        className={`accordion-item ${isExpanded ? "expanded" : ""} ${isActive ? "active" : ""}`}
                      >
                        <button
                          type="button"
                          className="accordion-header"
                          onClick={() => toggleExercise(key, globalIndex)}
                          aria-expanded={isExpanded}
                        >
                          <div className="accordion-header-content">
                            <span className="accordion-exercise-number">
                              {globalIndex + 1}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <span className="accordion-header-title">
                                {exercise.title}
                              </span>
                              {primaryDetail && (
                                <span className="accordion-header-subtitle">
                                  {primaryDetail.value}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="accordion-header-meta">
                            {kneeDetail && (
                              <span
                                className="badge badge-knee"
                                title="Knie-Alternative"
                              >
                                🦵
                              </span>
                            )}
                            {shoulderDetail && (
                              <span
                                className="badge badge-shoulder"
                                title="Schulter-Alternative"
                              >
                                💪
                              </span>
                            )}
                            <span className="accordion-chevron">
                              <ChevronDownIcon />
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="accordion-content">
                            {otherDetails.length > 0 && (
                              <div className="stack-sm">
                                {otherDetails.map((detail) => (
                                  <div
                                    key={`${key}-${detail.label}`}
                                    className={
                                      detail.label.includes("Alternative")
                                        ? "alternative-card"
                                        : "quick-info-card"
                                    }
                                    style={
                                      detail.label.includes("Knie")
                                        ? {
                                            backgroundColor:
                                              "var(--color-secondary-soft)",
                                          }
                                        : detail.label.includes("Schulter")
                                          ? {
                                              backgroundColor:
                                                "var(--color-phase-focus-bg)",
                                            }
                                          : {}
                                    }
                                  >
                                    <div className="quick-info-card-title">
                                      {detail.label}
                                    </div>
                                    <div className="quick-info-card-content">
                                      {detail.value}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {exerciseSlug && (
                              <div style={{ marginTop: "1rem" }}>
                                <Button
                                  to={`/uebungen/${exerciseSlug}`}
                                  variant="ghost"
                                  size="sm"
                                >
                                  Zur vollständigen Übung →
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          ) : (
            // Desktop: Verschachtelte Phase-Sections
            <div className="accordion">
              {session.phases.map((phase, phaseIndex) => {
                const phaseColorClass = getPhaseColorClass(phase.title);
                return (
                  <section
                    key={phase.title}
                    className={`phase-indicator ${phaseColorClass}`}
                    style={{
                      padding: 0,
                      borderRadius: "var(--radius-xl)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "1rem 1.25rem",
                        borderBottom: "1px solid var(--color-border-light)",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        {phase.title}
                      </h2>
                      {phase.description && (
                        <p
                          className="text-muted"
                          style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                        >
                          {phase.description}
                        </p>
                      )}
                    </div>

                    <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {phase.exercises.map((exercise, exerciseIndex) => {
                        const exerciseKey = `${phaseIndex}-${exerciseIndex}`;
                        const globalIndex = allExercises.findIndex(
                          (e) => e.key === exerciseKey,
                        );
                        const isExpanded = expandedExercises.has(exerciseKey);
                        const isActive = globalIndex === currentExerciseIndex;
                        const foundExercise = findExerciseByTitle(
                          exercise.title,
                        );
                        const exerciseSlug = foundExercise?.slug;
                        const primaryDetail = exercise.details.find(
                          (d) => d.label === "Durchführung",
                        );
                        const otherDetails = exercise.details.filter(
                          (d) => d.label !== "Durchführung",
                        );

                        const kneeDetail = otherDetails.find(
                          (d) => d.label === "Knie-Alternative",
                        );
                        const shoulderDetail = otherDetails.find(
                          (d) => d.label === "Schulter-Alternative",
                        );

                        return (
                          <li
                            key={exerciseKey}
                            ref={(el) => setExerciseRef(exerciseKey, el)}
                            className={`accordion-item ${isExpanded ? "expanded" : ""}`}
                            style={{
                              border: "none",
                              borderRadius: 0,
                              borderTop:
                                exerciseIndex > 0
                                  ? "1px solid var(--color-border-light)"
                                  : "none",
                              backgroundColor: isActive
                                ? "var(--color-primary-softer)"
                                : "transparent",
                            }}
                          >
                            <button
                              type="button"
                              className="accordion-header"
                              onClick={() =>
                                toggleExercise(exerciseKey, globalIndex)
                              }
                              aria-expanded={isExpanded}
                            >
                              <div className="accordion-header-content">
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                      "var(--color-surface-muted)",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    flexShrink: 0,
                                  }}
                                >
                                  {exerciseIndex + 1}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                  <span className="accordion-header-title">
                                    {exercise.title}
                                  </span>
                                  {primaryDetail && (
                                    <span
                                      className="text-muted"
                                      style={{
                                        display: "block",
                                        fontSize: "0.875rem",
                                        marginTop: "0.125rem",
                                      }}
                                    >
                                      {primaryDetail.value}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="accordion-header-meta">
                                {kneeDetail && (
                                  <span
                                    className="badge badge-knee"
                                    title="Knie-Alternative"
                                  >
                                    🦵
                                  </span>
                                )}
                                {shoulderDetail && (
                                  <span
                                    className="badge badge-shoulder"
                                    title="Schulter-Alternative"
                                  >
                                    💪
                                  </span>
                                )}
                                <span className="accordion-chevron">
                                  <ChevronDownIcon />
                                </span>
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="accordion-content">
                                {otherDetails.length > 0 && (
                                  <div className="stack-sm">
                                    {otherDetails.map((detail) => (
                                      <div
                                        key={`${exerciseKey}-${detail.label}`}
                                        className={
                                          detail.label.includes("Alternative")
                                            ? "alternative-card"
                                            : "quick-info-card"
                                        }
                                        style={
                                          detail.label.includes("Knie")
                                            ? {
                                                backgroundColor:
                                                  "var(--color-secondary-soft)",
                                              }
                                            : detail.label.includes("Schulter")
                                              ? {
                                                  backgroundColor:
                                                    "var(--color-phase-focus-bg)",
                                                }
                                              : {}
                                        }
                                      >
                                        <div className="quick-info-card-title">
                                          {detail.label}
                                        </div>
                                        <div className="quick-info-card-content">
                                          {detail.value}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {exerciseSlug && (
                                  <div style={{ marginTop: "1rem" }}>
                                    <Button
                                      to={`/uebungen/${exerciseSlug}`}
                                      variant="ghost"
                                      size="sm"
                                    >
                                      Zur vollständigen Übung →
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                );
              })}
            </div>
          )
        ) : (
          // Teilnehmer Mode: Karten-Layout
          <div className="exercise-cards-teilnehmer">
            {allExercises.map(({ exercise, key, phaseTitle }, globalIndex) => {
              const isActive = globalIndex === currentExerciseIndex;
              const foundExercise = findExerciseByTitle(exercise.title);

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
                      <h3 className="exercise-card-large-title">
                        {exercise.title}
                      </h3>
                      <p className="exercise-card-large-phase">{phaseTitle}</p>
                    </div>
                  </div>

                  <div className="exercise-card-large-content">
                    {exercise.details.map((detail) => (
                      <div
                        key={detail.label}
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
        )
      ) : (
        <p className="text-muted">Keine Übungen in dieser Stunde gefunden.</p>
      )}

      {/* Rating Section */}
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

      {/* Sticky Bottom Navigation */}
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
