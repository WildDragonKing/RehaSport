import { ThemeMode, useTheme } from "../theme/ThemeProvider";

const OPTIONS: Array<{ value: ThemeMode; label: string; icon: string }> = [
  { value: "light", label: "Hell", icon: "☀️" },
  { value: "dark", label: "Dunkel", icon: "🌙" },
  { value: "system", label: "System", icon: "💻" }
];

function ThemeSwitcher(): JSX.Element {
  const { mode, setMode } = useTheme();

  const currentOption = OPTIONS.find((opt) => opt.value === mode) ?? OPTIONS[2];

  function cycleTheme(): void {
    const currentIndex = OPTIONS.findIndex((opt) => opt.value === mode);
    const nextIndex = (currentIndex + 1) % OPTIONS.length;
    setMode(OPTIONS[nextIndex].value);
  }

  return (
    <button
      type="button"
      className="theme-switch"
      onClick={cycleTheme}
      aria-label={`Theme: ${currentOption.label}. Klicken zum Wechseln`}
      title={`Theme: ${currentOption.label}`}
    >
      <span className="theme-switch__icon" aria-hidden="true">
        {currentOption.icon}
      </span>
      <span className="visually-hidden">{currentOption.label}</span>
    </button>
  );
}

export default ThemeSwitcher;
