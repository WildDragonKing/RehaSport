import { useMemo, useState } from "react";
import Filters, { FilterState } from "./components/Filters";
import OverviewList from "./components/OverviewList";
import DetailView from "./components/DetailView";
import { useContentIndex } from "./hooks/useContentIndex";
import type { ContentEntry, ContentType } from "./types";

const TYPE_LABELS: Record<ContentType, string> = {
  stunde: "Stunden",
  übung: "Übungen",
  konzept: "Konzepte"
};

const initialFilters: FilterState = {
  search: "",
  concept: "",
  phase: "",
  tag: ""
};

function App(): JSX.Element {
  const { entries, isLoading, error } = useContentIndex();
  const [activeType, setActiveType] = useState<ContentType>("stunde");
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const typeEntries = useMemo(
    () => entries.filter((entry) => entry.type === activeType),
    [entries, activeType]
  );

  const filteredEntries = useMemo(() => {
    return typeEntries.filter((entry) => {
      if (filters.search) {
        const haystack = `${entry.title} ${entry.summary ?? ""} ${entry.concepts.join(" ")} ${entry.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(filters.search.toLowerCase())) {
          return false;
        }
      }
      if (filters.concept && !entry.concepts.some((concept) => concept.toLowerCase() === filters.concept.toLowerCase())) {
        return false;
      }
      if (filters.phase && !entry.phases.some((phase) => phase.toLowerCase() === filters.phase.toLowerCase())) {
        return false;
      }
      if (filters.tag && !entry.tags.some((tag) => tag.toLowerCase() === filters.tag.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [typeEntries, filters]);

  const activeEntry = useMemo<ContentEntry | undefined>(
    () => filteredEntries.find((entry) => entry.id === selectedId) ?? filteredEntries[0],
    [filteredEntries, selectedId]
  );

  const availableConcepts = useMemo(() => {
    return Array.from(new Set(typeEntries.flatMap((entry) => entry.concepts))).sort((a, b) => a.localeCompare(b));
  }, [typeEntries]);

  const availablePhases = useMemo(() => {
    return Array.from(new Set(typeEntries.flatMap((entry) => entry.phases))).sort((a, b) => a.localeCompare(b));
  }, [typeEntries]);

  const availableTags = useMemo(() => {
    return Array.from(new Set(typeEntries.flatMap((entry) => entry.tags))).sort((a, b) => a.localeCompare(b));
  }, [typeEntries]);

  const handleSelect = (entry: ContentEntry) => {
    setSelectedId(entry.id);
  };

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
  };

  const handleTypeChange = (type: ContentType) => {
    setActiveType(type);
    setFilters(initialFilters);
    setSelectedId(undefined);
  };

  return (
    <div className="app-shell">
      <aside className="card">
        <nav className="nav-tabs" aria-label="Inhaltsbereich wählen">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <button
              key={type}
              className={type === activeType ? "active" : ""}
              onClick={() => handleTypeChange(type as ContentType)}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>

        <Filters
          isLoading={isLoading}
          errorMessage={error?.message}
          filters={filters}
          onChange={handleFiltersChange}
          concepts={availableConcepts}
          phases={availablePhases}
          tags={availableTags}
        />

        <OverviewList
          entries={filteredEntries}
          activeEntry={activeEntry}
          isLoading={isLoading}
          onSelect={handleSelect}
        />
      </aside>
      <main className="detail-view">
        <DetailView entry={activeEntry} />
      </main>
    </div>
  );
}

export default App;
