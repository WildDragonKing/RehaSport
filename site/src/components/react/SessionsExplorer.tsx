import { useEffect, useMemo, useState, type ReactElement } from "react";

import { getDataset } from "../../lib/content";
import type { SessionDetail } from "../../lib/types";

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | {
      type: "ready";
      sessions: SessionDetail[];
    };

function parsePath(pathname: string):
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

export default function SessionsExplorer(): ReactElement {
  const [state, setState] = useState<ViewState>({ type: "loading" });
  const [query, setQuery] = useState("");
  const [pathState] = useState(() =>
    typeof window === "undefined" ? { kind: "list" as const } : parsePath(window.location.pathname),
  );

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
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setState({
          type: "error",
          message:
            error instanceof Error ? error.message : "Stunden konnten nicht geladen werden.",
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
    return <div className="container section"><div className="empty">Lade Stunden …</div></div>;
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
        item.categorySlug === pathState.categorySlug && item.slug === pathState.sessionSlug,
    );

    if (!session) {
      return (
        <div className="container section stack">
          <div className="breadcrumb breadcrumb-session">
            <a className="breadcrumb-back" href="/stunden">Zurück zu Stunden</a>
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
          <a className="breadcrumb-back" href="/stunden">Zurück zu Stunden</a>
          <span className="breadcrumb-separator breadcrumb-optional">/</span>
          <span className="breadcrumb-segment breadcrumb-optional">{session.categoryTitle}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{session.title}</span>
        </div>

        <header className="stack">
          <h1 className="section-title">{session.title}</h1>
          <p className="muted">{session.description || "Keine Beschreibung verfügbar."}</p>
          <div className="meta session-detail-meta">
            <span>{session.duration || "45 Min"}</span>
            <span>{session.exerciseCount} Übungen</span>
            {session.focus ? <span>{session.focus}</span> : null}
          </div>
        </header>

        <div className="stack session-phases">
          {session.phases.map((phase, phaseIndex) => (
            <details className="card phase" key={`${phase.title}-${phaseIndex}`} open={phaseIndex === 0}>
              <summary className="phase-summary">
                <span className="phase-summary-title">{phase.title}</span>
                <span className="badge phase-summary-count">{phase.exercises.length} Übungen</span>
              </summary>
              <div className="phase-body stack">
                {phase.description ? <p>{phase.description}</p> : null}
                {phase.exercises.length > 0 ? (
                  <ol className="phase-exercise-list stack">
                    {phase.exercises.map((exercise, index) => (
                      <li className="phase-exercise-item" key={`${exercise.title}-${index}`}>
                        <strong>{exercise.title}</strong>
                        {exercise.details.length > 0 ? (
                          <ul className="phase-detail-list stack">
                            {exercise.details.map((detail, detailIndex) => (
                              <li className="phase-detail-item" key={`${detail.label}-${detailIndex}`}>
                                <span className="muted phase-detail-label">{detail.label}</span>
                                <span className="phase-detail-value">{detail.value}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="muted">Für diese Phase sind keine Übungen hinterlegt.</p>
                )}
              </div>
            </details>
          ))}
        </div>
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
          <input className="input" value={String(filteredSessions.length)} readOnly />
        </label>

        <div className="notice">
          Kategorien wurden entfernt. Nutze die Suche, um direkt zur passenden Stunde zu springen.
        </div>
      </div>

      {filteredSessions.length > 0 ? (
        <ul className="list">
          {filteredSessions.map((session) => (
            <li key={`${session.categorySlug}-${session.slug}`}>
              <article className="card stack session-card">
                <h2 className="session-card-title">{session.title}</h2>
                <p className="session-card-description">{session.description || "Ohne Kurzbeschreibung."}</p>
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
        <div className="empty">Keine Stunden gefunden. Passe Suche oder Filter an.</div>
      )}
    </section>
  );
}
