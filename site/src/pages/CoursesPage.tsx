import { useMemo, useState } from "react";

import CourseCard from "../components/content/CourseCard";
import Button from "../components/ui/Button";
import Section from "../components/ui/Section";
import { courses } from "../content/courses";

const courseLevels = Array.from(new Set(courses.map((course) => course.level)));

function CoursesPage(): JSX.Element {
  const [levelFilter, setLevelFilter] = useState<string>("alle");
  const [search, setSearch] = useState<string>("");

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesLevel = levelFilter === "alle" || course.level === levelFilter;
      const haystack = `${course.title} ${course.focus} ${course.description} ${course.location}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [levelFilter, search]);

  return (
    <div>
      <Section
        id="kursuebersicht"
        title="Unsere Kursübersicht"
        lead="Finde den passenden Kurs für deine Ziele. Mit den Filtern kannst du gezielt nach Niveau oder Stichwort suchen."
        alignment="left"
      >
        <form className="form" aria-label="Kursfilter">
          <div className="form__row form__row--split">
            <label className="label" htmlFor="level">
              Kursniveau
              <select
                id="level"
                name="level"
                className="select"
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value)}
              >
                <option value="alle">Alle Level</option>
                {courseLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label className="label" htmlFor="search">
              Suche nach Kurs oder Schwerpunkt
              <input
                id="search"
                name="search"
                className="input"
                type="search"
                placeholder="z.B. Schulter, Balance, Knie"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
        </form>
        <div className="grid grid--two-columns mt-md">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        {filteredCourses.length === 0 ? (
          <p className="text-muted mt-md">Kein Kurs erfüllt aktuell die Filter. Bitte passe deine Auswahl an.</p>
        ) : null}
        <div className="text-center mt-md">
          <Button to="/kontakt" variant="secondary">
            Ich habe Fragen zur Anmeldung
          </Button>
        </div>
      </Section>
    </div>
  );
}

export default CoursesPage;
