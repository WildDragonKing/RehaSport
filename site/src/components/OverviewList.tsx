import type { ContentEntry } from "../types";

interface OverviewListProps {
  entries: ContentEntry[];
  activeEntry?: ContentEntry;
  isLoading: boolean;
  onSelect: (entry: ContentEntry) => void;
}

function OverviewList({ entries, activeEntry, isLoading, onSelect }: OverviewListProps): JSX.Element {
  if (isLoading) {
    return <p>Inhalte werden geladen …</p>;
  }

  if (!entries.length) {
    return <div className="empty-state">Keine Inhalte gefunden.</div>;
  }

  return (
    <div className="list" role="list">
      {entries.map((entry) => {
        const isActive = entry.id === activeEntry?.id;
        return (
          <button
            key={entry.id}
            type="button"
            className={`list-item${isActive ? " active" : ""}`}
            onClick={() => onSelect(entry)}
          >
            <strong>{entry.title}</strong>
            {entry.summary ? <small>{entry.summary}</small> : null}
            <div className="badge-row">
              {entry.concepts.map((concept) => (
                <span key={`${entry.id}-concept-${concept}`} className="badge concept">
                  {concept}
                </span>
              ))}
              {entry.phases.map((phase) => (
                <span key={`${entry.id}-phase-${phase}`} className="badge phase">
                  {phase}
                </span>
              ))}
              {entry.tags.map((tag) => (
                <span key={`${entry.id}-tag-${tag}`} className="badge">
                  #{tag}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default OverviewList;
