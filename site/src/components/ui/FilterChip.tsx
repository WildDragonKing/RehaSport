/**
 * FilterChip - Reusable filter chip component
 *
 * Provides consistent filter chip styling across the application.
 * Can be used as a button (single select) or checkbox (multi select).
 */

interface FilterChipProps {
  /** The label text shown in the chip */
  label: string;
  /** Whether the chip is currently selected/active */
  isActive: boolean;
  /** Click handler for the chip */
  onClick: () => void;
  /** Optional icon to show before the label */
  icon?: React.ReactNode;
  /** Optional count to show after the label */
  count?: number;
  /** Optional phase dot color (for phase filters) */
  phaseColor?: string;
  /** Additional CSS classes */
  className?: string;
}

function FilterChip({
  label,
  isActive,
  onClick,
  icon,
  count,
  phaseColor,
  className = "",
}: FilterChipProps): JSX.Element {
  return (
    <button
      type="button"
      className={`filter-chip ${isActive ? "filter-chip-active" : ""} ${className}`}
      onClick={onClick}
      aria-pressed={isActive}
    >
      {phaseColor && (
        <span
          className="filter-chip-phase-dot"
          style={{ backgroundColor: phaseColor }}
        />
      )}
      {icon && <span className="filter-chip-icon">{icon}</span>}
      <span className="filter-chip-label">{label}</span>
      {count !== undefined && (
        <span className="filter-chip-count">{count}</span>
      )}
    </button>
  );
}

export default FilterChip;
