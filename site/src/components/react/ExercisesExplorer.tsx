import { useEffect, useMemo, useState, type ReactElement } from "react";

import { getDataset } from "../../lib/content";
import type { ExerciseDetail } from "../../lib/types";

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "ready"; exercises: ExerciseDetail[] };

function parsePath(
  pathname: string,
): { kind: "list" } | { kind: "detail"; exerciseSlug: string } {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    if (slug) {
      return { kind: "detail", exerciseSlug: slug };
    }
  }

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2) {
    return { kind: "detail", exerciseSlug: decodeURIComponent(parts[1]) };
  }
  return { kind: "list" };
}

export default function ExercisesExplorer(): ReactElement {
  const [state, setState] = useState<ViewState>({ type: "loading" });
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("alle");
  const [difficultyFilter, setDifficultyFilter] = useState("alle");
  const [pathState] = useState(() =>
    typeof window === "undefined"
      ? { kind: "list" as const }
      : parsePath(window.location.pathname),
  );

  useEffect(() => {
    let cancelled = false;

    getDataset()
      .then((dataset) => {
        if (!cancelled) {
          setState({ type: "ready", exercises: dataset.exercises });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "Übungen konnten nicht geladen werden.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const areas = useMemo(() => {
    if (state.type !== "ready") {
      return [] as string[];
    }

    return Array.from(
      new Set(
        state.exercises
          .map((exercise) => exercise.area)
          .filter((area): area is string => Boolean(area && area.length > 0)),
      ),
    ).sort((a, b) => a.localeCompare(b, "de"));
  }, [state]);

  const difficulties = useMemo(() => {
    if (state.type !== "ready") {
      return [] as string[];
    }

    return Array.from(
      new Set(
        state.exercises
          .map((exercise) => exercise.difficulty)
          .filter((item): item is string => Boolean(item && item.length > 0)),
      ),
    ).sort((a, b) => a.localeCompare(b, "de"));
  }, [state]);

  const filteredExercises = useMemo(() => {
    if (state.type !== "ready") {
      return [] as ExerciseDetail[];
    }

    return state.exercises.filter((exercise) => {
      if (areaFilter !== "alle" && exercise.area !== areaFilter) {
        return false;
      }

      if (
        difficultyFilter !== "alle" &&
        exercise.difficulty !== difficultyFilter
      ) {
        return false;
      }

      if (!query.trim()) {
        return true;
      }

      const term = query.toLowerCase();
      return (
        exercise.title.toLowerCase().includes(term) ||
        exercise.summary?.toLowerCase().includes(term) ||
        exercise.focus?.toLowerCase().includes(term) ||
        exercise.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    });
  }, [state, areaFilter, difficultyFilter, query]);

  if (state.type === "loading") {
    return (
      <div className="container section">
        <div className="empty">Lade Übungen …</div>
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
    const exercise = state.exercises.find(
      (entry) => entry.slug === pathState.exerciseSlug,
    );

    if (!exercise) {
      return (
        <div className="container section stack">
          <div className="breadcrumb">
            <a href="/uebungen">Übungen</a>
            <span>/</span>
            <span>Unbekannt</span>
          </div>
          <div className="error">Diese Übung wurde nicht gefunden.</div>
        </div>
      );
    }

    return (
      <section className="container section stack">
        <div className="breadcrumb">
          <a href="/uebungen">Übungen</a>
          <span>/</span>
          <span>{exercise.title}</span>
        </div>

        <header className="stack">
          <h1 className="section-title">{exercise.title}</h1>
          <p className="muted">
            {exercise.summary || "Keine Kurzbeschreibung vorhanden."}
          </p>
          <div className="meta">
            {exercise.area ? <span>{exercise.area}</span> : null}
            {exercise.difficulty ? <span>{exercise.difficulty}</span> : null}
            {exercise.duration ? <span>{exercise.duration}</span> : null}
          </div>
        </header>

        {exercise.sections.length > 0 ? (
          <div className="stack">
            {exercise.sections.map((section) => (
              <article key={section.title} className="card stack">
                <h2>{section.title}</h2>
                <p>{section.content}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            Für diese Übung sind keine Detailabschnitte hinterlegt.
          </div>
        )}

        {exercise.kneeAlternative || exercise.shoulderAlternative ? (
          <section className="stack">
            <h2>Alternativen</h2>
            <div className="grid grid-2">
              {exercise.kneeAlternative ? (
                <article className="notice stack">
                  <strong>{exercise.kneeAlternative.title}</strong>
                  <span>{exercise.kneeAlternative.description}</span>
                </article>
              ) : null}
              {exercise.shoulderAlternative ? (
                <article className="notice stack">
                  <strong>{exercise.shoulderAlternative.title}</strong>
                  <span>{exercise.shoulderAlternative.description}</span>
                </article>
              ) : null}
            </div>
          </section>
        ) : null}

        {exercise.contraindications && exercise.contraindications.length > 0 ? (
          <section className="stack">
            <h2>Hinweise</h2>
            <ul className="list">
              {exercise.contraindications.map((item) => (
                <li key={item} className="card">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </section>
    );
  }

  return (
    <section className="container section stack">
      <header>
        <h1 className="section-title">Übungen</h1>
        <p className="section-subtitle">
          Filtere präzise und öffne sofort die passende Übung.
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
            placeholder="z. B. Schulter, Dehnung, Mobilisation"
          />
        </label>

        <label>
          <span className="muted">Bereich</span>
          <select
            className="select"
            value={areaFilter}
            onChange={(event) => setAreaFilter(event.target.value)}
          >
            <option value="alle">Alle Bereiche</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="muted">Schwierigkeit</span>
          <select
            className="select"
            value={difficultyFilter}
            onChange={(event) => setDifficultyFilter(event.target.value)}
          >
            <option value="alle">Alle Stufen</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredExercises.length > 0 ? (
        <ul className="list grid grid-2">
          {filteredExercises.map((exercise) => (
            <li key={exercise.slug}>
              <article className="card stack">
                <h2>{exercise.title}</h2>
                <p>{exercise.summary || "Ohne Kurzbeschreibung."}</p>
                <div className="meta">
                  {exercise.area ? <span>{exercise.area}</span> : null}
                  {exercise.difficulty ? (
                    <span>{exercise.difficulty}</span>
                  ) : null}
                  {exercise.duration ? <span>{exercise.duration}</span> : null}
                </div>
                <div className="meta">
                  {exercise.tags.slice(0, 4).map((tag) => (
                    <span key={`${exercise.slug}-${tag}`} className="badge">
                      #{tag}
                    </span>
                  ))}
                </div>
                <a
                  className="btn btn-primary"
                  href={`/uebungen?slug=${encodeURIComponent(exercise.slug)}`}
                >
                  Details öffnen
                </a>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          Keine Übungen gefunden. Passe Suchbegriff oder Filter an.
        </div>
      )}
    </section>
  );
}
