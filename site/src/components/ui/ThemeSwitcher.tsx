import { ThemeMode, useTheme } from "../theme/ThemeProvider";

const OPTIONS: Array<{ value: ThemeMode; label: string; icon: string }> = [
  { value: "light", label: "Hell", icon: "sun" },
  { value: "dark", label: "Dunkel", icon: "moon" },
  { value: "system", label: "System", icon: "monitor" },
];

// SVG Icons als Komponenten
function SunIcon(): JSX.Element {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon(): JSX.Element {
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
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function MonitorIcon(): JSX.Element {
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
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

function ThemeSwitcher(): JSX.Element {
  const { mode, setMode } = useTheme();

  const currentOption = OPTIONS.find((opt) => opt.value === mode) ?? OPTIONS[2];

  function cycleTheme(): void {
    const currentIndex = OPTIONS.findIndex((opt) => opt.value === mode);
    const nextIndex = (currentIndex + 1) % OPTIONS.length;
    setMode(OPTIONS[nextIndex].value);
  }

  function getIcon(): JSX.Element {
    switch (currentOption.icon) {
      case "sun":
        return <SunIcon />;
      case "moon":
        return <MoonIcon />;
      default:
        return <MonitorIcon />;
    }
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon"
      onClick={cycleTheme}
      aria-label={`Theme: ${currentOption.label}. Klicken zum Wechseln`}
      title={`Theme: ${currentOption.label}`}
    >
      <span aria-hidden="true">{getIcon()}</span>
      <span className="sr-only">{currentOption.label}</span>
    </button>
  );
}

export default ThemeSwitcher;
