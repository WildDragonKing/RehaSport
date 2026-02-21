import { useEffect, useMemo, useState, type ReactElement } from "react";

import { getDataset } from "../../lib/content";
import type {
  ExerciseDetail,
  SessionDetail,
  SessionExercise,
} from "../../lib/types";
import SessionVersionHistory from "./SessionVersionHistory";

type Restriction = "knee" | "shoulder";

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | {
      type: "ready";
      sessions: SessionDetail[];
      exerciseMap: Map<string, ExerciseDetail>;
    };

function parsePath(
  pathname: string,
):
  | { kind: "list" }
  | { kind: "detail"; categorySlug: string; sessionSlug: string } {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const categorySlug = params.get("cat");
    const sessionSlug = params.get("slug");
    if (categorySlug && sessionSlug) {
      return { kind: "detail", categorySlug, sessionSlug };
    }
  }

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 3) {
    return {
      kind: "detail",
      categorySlug: decodeURIComponent(parts[1]),
      sessionSlug: decodeURIComponent(parts[2]),
    };
  }
  return { kind: "list" };
}

// Aufklappbare Uebungsdetails mit Bibliotheks-Verknuepfung
function ExerciseInlineDetail({
  exercise,
  exerciseMap,
  activeRestrictions,
}: {
  exercise: SessionExercise;
  exerciseMap: Map<string, ExerciseDetail>;
  activeRestrictions: Set<Restriction>;
}): ReactElement {
  const linked = exercise.slug ? exerciseMap.get(exercise.slug) : undefined;

  // Inline-Alternativen aus der Session oder aus der Bibliothek
  const kneeAlt =
    exercise.kneeAlternative || linked?.kneeAlternative?.description;
  const shoulderAlt =
    exercise.shoulderAlternative || linked?.shoulderAlternative?.description;
  const hasAlternatives = Boolean(kneeAlt || shoulderAlt);

  // Hervorgehobene Alternativen bei aktiver Restriction
  const kneeHighlighted = activeRestrictions.has("knee") && kneeAlt;
  const shoulderHighlighted = activeRestrictions.has("shoulder") && shoulderAlt;

  if (!linked) {
    // Fallback: keine Bibliotheks-Verknuepfung, bisherige Darstellung
    return (
      <li className="phase-exercise-item">
        <strong>
          {exercise.title}
          {exercise.isGame ? (
            <span className="badge game-badge">Spiel</span>
          ) : null}
        </strong>
        {exercise.details.length > 0 ? (
          <ul className="phase-detail-list stack">
            {exercise.details.map((detail, i) => (
              <li className="phase-detail-item" key={`${detail.label}-${i}`}>
                <span className="muted phase-detail-label">{detail.label}</span>
                <span className="phase-detail-value">{detail.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {/* Inline-Alternativen auch ohne Bibliothek anzeigen */}
        {(kneeHighlighted || shoulderHighlighted) && (
          <div className="exercise-alternatives">
            {kneeHighlighted ? (
              <div className="exercise-alt exercise-alt-knee exercise-alt-highlighted">
                <strong>Knie-Alternative:</strong> {kneeAlt}
              </div>
            ) : null}
            {shoulderHighlighted ? (
              <div className="exercise-alt exercise-alt-shoulder exercise-alt-highlighted">
                <strong>Schulter-Alternative:</strong> {shoulderAlt}
              </div>
            ) : null}
          </div>
        )}
      </li>
    );
  }

  // Verknuepfte Uebung: aufklappbare Details
  const difficulty = exercise.difficulty || linked.difficulty;
  const meta = exercise.details
    .map((d) => `${d.label}: ${d.value}`)
    .join(" · ");

  return (
    <li className="phase-exercise-item">
      <details className="exercise-expandable">
        <summary className="exercise-expandable-summary">
          <strong>
            {exercise.title}
            {exercise.isGame ? (
              <>
                {" "}
                <span className="badge game-badge">Spiel</span>
              </>
            ) : null}
          </strong>
          {difficulty ? (
            <span className={`badge difficulty-${difficulty.toLowerCase()}`}>
              {difficulty}
            </span>
          ) : null}
          {meta ? <span className="exercise-inline-meta">{meta}</span> : null}
          <span className="exercise-expand-icon" aria-hidden="true">
            +
          </span>
        </summary>
        <div className="exercise-expandable-body">
          {/* Tags */}
          {linked.tags.length > 0 ? (
            <div className="meta">
              {linked.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="badge">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {/* Sections (Ausfuehrung, Tipps etc.) */}
          {linked.sections.length > 0 ? (
            <div className="exercise-sections">
              {linked.sections.map((section) => (
                <div key={section.title}>
                  <div className="exercise-section-title">{section.title}</div>
                  <p className="exercise-section-content">{section.content}</p>
                </div>
              ))}
            </div>
          ) : null}

          {/* Alternativen */}
          {hasAlternatives ? (
            <div className="exercise-alternatives">
              {kneeAlt ? (
                <div
                  className={`exercise-alt exercise-alt-knee${kneeHighlighted ? " exercise-alt-highlighted" : ""}`}
                >
                  <strong>
                    {linked.kneeAlternative?.title || "Knie-Alternative"}:
                  </strong>{" "}
                  {kneeAlt}
                </div>
              ) : null}
              {shoulderAlt ? (
                <div
                  className={`exercise-alt exercise-alt-shoulder${shoulderHighlighted ? " exercise-alt-highlighted" : ""}`}
                >
                  <strong>
                    {linked.shoulderAlternative?.title ||
                      "Schulter-Alternative"}
                    :
                  </strong>{" "}
                  {shoulderAlt}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Kontraindikationen */}
          {linked.contraindications && linked.contraindications.length > 0 ? (
            <div className="exercise-contraindications">
              <strong>Hinweise:</strong>
              <ul>
                {linked.contraindications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Link zur vollen Uebungsseite */}
          <a
            className="btn btn-secondary"
            href={`/uebungen?slug=${encodeURIComponent(linked.slug)}`}
          >
            Volle Details anzeigen
          </a>
        </div>
      </details>
    </li>
  );
}

export default function SessionsExplorer(): ReactElement {
  const [state, setState] = useState<ViewState>({ type: "loading" });
  const [query, setQuery] = useState("");
  const [activeRestrictions, setActiveRestrictions] = useState<
    Set<Restriction>
  >(new Set());
  const [pathState] = useState(() =>
    typeof window === "undefined"
      ? { kind: "list" as const }
      : parsePath(window.location.pathname),
  );

  function toggleRestriction(restriction: Restriction): void {
    setActiveRestrictions((prev) => {
      const next = new Set(prev);
      if (next.has(restriction)) {
        next.delete(restriction);
      } else {
        next.add(restriction);
      }
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;

    getDataset()
      .then((dataset) => {
        if (cancelled) {
          return;
        }

        setState({
          type: "ready",
          sessions: dataset.sessions,
          exerciseMap: dataset.exerciseMap,
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setState({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Stunden konnten nicht geladen werden.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSessions = useMemo(() => {
    if (state.type !== "ready") {
      return [];
    }

    return state.sessions.filter((session) => {
      if (!query.trim()) {
        return true;
      }

      const term = query.toLowerCase();
      return (
        session.title.toLowerCase().includes(term) ||
        session.description?.toLowerCase().includes(term) ||
        session.focus?.toLowerCase().includes(term)
      );
    });
  }, [state, query]);

  if (state.type === "loading") {
    return (
      <div className="container section">
        <div className="empty">Lade Stunden …</div>
      </div>
    );
  }

  if (state.type === "error") {
    return (
      <div className="container section">
        <div className="error">{state.message}</div>
      </div>
    );
  }

  if (pathState.kind === "detail") {
    const session = state.sessions.find(
      (item) =>
        item.categorySlug === pathState.categorySlug &&
        item.slug === pathState.sessionSlug,
    );

    if (!session) {
      return (
        <div className="container section stack">
          <div className="breadcrumb breadcrumb-session">
            <a className="breadcrumb-back" href="/stunden">
              Zurück zu Stunden
            </a>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Unbekannt</span>
          </div>
          <div className="error">Diese Stunde wurde nicht gefunden.</div>
        </div>
      );
    }

    return (
      <section className="container section stack">
        <div className="breadcrumb breadcrumb-session">
          <a className="breadcrumb-back" href="/stunden">
            Zurück zu Stunden
          </a>
          <span className="breadcrumb-separator breadcrumb-optional">/</span>
          <span className="breadcrumb-optional">{session.categoryTitle}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{session.title}</span>
        </div>

        <header className="stack">
          <h1 className="section-title">{session.title}</h1>
          <p className="muted">
            {session.description || "Keine Beschreibung verfügbar."}
          </p>
          <div className="meta session-detail-meta">
            <span>{session.duration || "45 Min"}</span>
            <span>{session.exerciseCount} Übungen</span>
            {session.focus ? <span>{session.focus}</span> : null}
          </div>
        </header>

        {/* Restriction-Bar: Einschraenkungen der Gruppe markieren */}
        <div
          className="restriction-bar"
          role="toolbar"
          aria-label="Einschränkungen"
        >
          <span className="restriction-bar-label">Einschränkungen:</span>
          <button
            className={`btn badge restriction-toggle${activeRestrictions.has("knee") ? " restriction-active" : ""}`}
            onClick={() => toggleRestriction("knee")}
            aria-pressed={activeRestrictions.has("knee")}
            type="button"
          >
            Knie
          </button>
          <button
            className={`btn badge restriction-toggle${activeRestrictions.has("shoulder") ? " restriction-active" : ""}`}
            onClick={() => toggleRestriction("shoulder")}
            aria-pressed={activeRestrictions.has("shoulder")}
            type="button"
          >
            Schulter
          </button>
        </div>

        <div className="stack session-phases">
          {session.phases.map((phase, phaseIndex) => (
            <details
              className="card phase"
              key={`${phase.title}-${phaseIndex}`}
              open={phaseIndex === 0}
            >
              <summary
                className="phase-summary"
                aria-label={`${phase.title} – ${phase.exercises.length} Übungen`}
              >
                <span className="phase-summary-title">{phase.title}</span>
                <span className="badge phase-summary-count">
                  {phase.exercises.length} Übungen
                </span>
              </summary>
              <div className="phase-body stack">
                {phase.description ? <p>{phase.description}</p> : null}
                {phase.exercises.length > 0 ? (
                  <ol className="phase-exercise-list stack">
                    {phase.exercises.map((exercise, index) => (
                      <ExerciseInlineDetail
                        key={`${exercise.title}-${index}`}
                        exercise={exercise}
                        exerciseMap={state.exerciseMap}
                        activeRestrictions={activeRestrictions}
                      />
                    ))}
                  </ol>
                ) : (
                  <p className="muted">
                    Für diese Phase sind keine Übungen hinterlegt.
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>

        {/* Aenderungs-Historie (nur fuer eingeloggte Trainer sichtbar) */}
        {session.firestoreId ? (
          <SessionVersionHistory sessionFirestoreId={session.firestoreId} />
        ) : null}
      </section>
    );
  }

  return (
    <section className="container section stack">
      <header>
        <h1 className="section-title">Stunden</h1>
        <p className="section-subtitle">
          Suche gezielt nach Inhalten und öffne direkt die passende Stunde.
        </p>
      </header>

      <div className="tool-bar" role="search">
        <label>
          <span className="muted">Suche</span>
          <input
            className="input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="z. B. Schulter, Mobilisation, Balance"
          />
        </label>

        <label>
          <span className="muted">Treffer</span>
          <input
            className="input"
            value={String(filteredSessions.length)}
            readOnly
          />
        </label>

        <div className="notice">
          Kategorien wurden entfernt. Nutze die Suche, um direkt zur passenden
          Stunde zu springen.
        </div>
      </div>

      {filteredSessions.length > 0 ? (
        <ul className="list">
          {filteredSessions.map((session) => (
            <li key={`${session.categorySlug}-${session.slug}`}>
              <article className="card stack session-card">
                <h2 className="session-card-title">{session.title}</h2>
                <p className="session-card-description">
                  {session.description || "Ohne Kurzbeschreibung."}
                </p>
                <div className="meta session-meta">
                  <span>{session.categoryTitle}</span>
                  <span>{session.duration || "45 Min"}</span>
                  <span>{session.exerciseCount} Übungen</span>
                </div>
                <a
                  className="btn btn-primary session-open-btn"
                  href={`/stunden?cat=${encodeURIComponent(session.categorySlug)}&slug=${encodeURIComponent(session.slug)}`}
                >
                  Stunde öffnen
                </a>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          Keine Stunden gefunden. Passe Suche oder Filter an.
        </div>
      )}
    </section>
  );
}
