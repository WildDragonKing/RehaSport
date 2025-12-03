interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Search Icon
function SearchIcon(): JSX.Element {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

// Close Icon
function CloseIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SearchBar({ value, onChange, placeholder = "Übung suchen..." }: SearchBarProps): JSX.Element {
  return (
    <div className="search-input-wrapper">
      <span className="search-icon" aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        type="search"
        className="input search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Übungen durchsuchen"
      />
      {value && (
        <button
          type="button"
          className="search-clear btn btn-ghost btn-icon btn-sm"
          onClick={() => onChange("")}
          aria-label="Suche löschen"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
