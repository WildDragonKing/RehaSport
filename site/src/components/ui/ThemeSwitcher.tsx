import { ChangeEvent, useId } from "react";

import { ThemeMode, useTheme } from "../theme/ThemeProvider";

const OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: "light", label: "Hell" },
  { value: "dark", label: "Dunkel" },
  { value: "system", label: "System" }
];

function ThemeSwitcher(): JSX.Element {
  const { mode, setMode } = useTheme();
  const id = useId();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setMode(event.target.value as ThemeMode);
  };

  return (
    <label className="theme-switch" htmlFor={id}>
      <span className="visually-hidden">Darstellungsmodus wählen</span>
      <select
        id={id}
        value={mode}
        onChange={handleChange}
        className="theme-switch__select"
        aria-label="Darstellungsmodus"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ThemeSwitcher;
