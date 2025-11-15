import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import { REPO_BASE_URL } from "../config";
import type { ContentEntry } from "../types";

const renderer = new marked.Renderer();

renderer.code = (code: string, infostring: string | undefined) => {
  const language = (infostring ?? "").trim().split(/\s+/)[0];

  if (language && hljs.getLanguage(language)) {
    const { value } = hljs.highlight(code, { language });
    return `<pre><code class="hljs language-${language}">${value}</code></pre>`;
  }

  const { value } = hljs.highlightAuto(code);
  return `<pre><code class="hljs">${value}</code></pre>`;
};

marked.use({ renderer });

const contentCache = new Map<string, string>();

interface DetailViewProps {
  entry?: ContentEntry;
}

function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function DetailView({ entry }: DetailViewProps): JSX.Element {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const heading = useMemo(() => {
    if (!entry) {
      return "Wähle einen Eintrag";
    }
    const label = entry.type === "stunde" ? "Stunde" : entry.type === "übung" ? "Übung" : "Konzept";
    return `${label}: ${entry.title}`;
  }, [entry]);

  useEffect(() => {
    if (!entry) {
      setHtml("");
      setError(undefined);
      return;
    }

    const cacheKey = entry.path;
    if (contentCache.has(cacheKey)) {
      setHtml(contentCache.get(cacheKey) ?? "");
      setError(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(undefined);
    const controller = new AbortController();

    const url = `${REPO_BASE_URL}${encodePath(entry.path)}`;

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Markdown konnte nicht geladen werden (${response.status})`);
        }
        return response.text();
      })
      .then((markdown) => {
        const rendered = marked.parse(markdown, { async: false }) as string;
        contentCache.set(cacheKey, rendered);
        setHtml(rendered);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) {
          return;
        }
        setError(err.message);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [entry]);

  return (
    <article>
      <header>
        <h1>{heading}</h1>
        {entry ? (
          <div className="badge-row">
            {entry.concepts.map((concept) => (
              <span key={`detail-concept-${concept}`} className="badge concept">
                {concept}
              </span>
            ))}
            {entry.phases.map((phase) => (
              <span key={`detail-phase-${phase}`} className="badge phase">
                {phase}
              </span>
            ))}
            {entry.tags.map((tag) => (
              <span key={`detail-tag-${tag}`} className="badge">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {!entry ? <p>Bitte wähle einen Eintrag aus der Liste.</p> : null}
      {loading ? <p>Markdown wird geladen …</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!loading && !error && entry ? <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} /> : null}
    </article>
  );
}

export default DetailView;
