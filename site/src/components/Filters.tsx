import type { ChangeEvent } from "react";

export interface FilterState {
  search: string;
  concept: string;
  phase: string;
  tag: string;
}

interface FiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  concepts: string[];
  phases: string[];
  tags: string[];
  isLoading: boolean;
  errorMessage?: string;
}

function Filters({ filters, onChange, concepts, phases, tags, isLoading, errorMessage }: FiltersProps): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div>
      <div className="filter-group">
        <label htmlFor="search">Suche</label>
        <input
          id="search"
          name="search"
          type="search"
          placeholder="Titel, Konzept oder Tag"
          value={filters.search}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="concept">Konzept</label>
        <select id="concept" name="concept" value={filters.concept} onChange={handleChange} disabled={isLoading}>
          <option value="">Alle Konzepte</option>
          {concepts.map((concept) => (
            <option key={concept} value={concept}>
              {concept}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="phase">Phase/Bereich</label>
        <select id="phase" name="phase" value={filters.phase} onChange={handleChange} disabled={isLoading}>
          <option value="">Alle Phasen</option>
          {phases.map((phase) => (
            <option key={phase} value={phase}>
              {phase}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="tag">Tags</label>
        <select id="tag" name="tag" value={filters.tag} onChange={handleChange} disabled={isLoading}>
          <option value="">Alle Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
    </div>
  );
}

export default Filters;
