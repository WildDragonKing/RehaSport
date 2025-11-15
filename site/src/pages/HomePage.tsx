import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import { courses } from "../content/courses";
import { highlights } from "../content/highlights";

function HomePage(): JSX.Element {
  const featuredCourses = courses.slice(0, 3);

  return (
    <div>
      <div className="container">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__content">
            <h1 id="hero-title">RehaSport, der motiviert und wirkt</h1>
            <p>
              Individuelle Betreuung, abgestimmte Übungsprogramme und ein Team, das zuhört.
              Wir begleiten dich vom ersten Arztgespräch bis zum spürbaren Fortschritt im Alltag.
            </p>
            <div className="hero__actions">
              <Button to="/kurse">Zu den Kursen</Button>
              <Button to="/kontakt" variant="secondary">
                Beratung anfragen
              </Button>
            </div>
          </div>
          <div className="hero__image" aria-hidden="true">
            <svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="400" height="320" rx="32" fill="url(#heroGradient)" />
              <circle cx="320" cy="70" r="48" fill="#a855f7" opacity="0.2" />
              <circle cx="80" cy="250" r="36" fill="#f59e0b" opacity="0.3" />
              <path
                d="M80 190 C130 120 220 110 320 160"
                stroke="#ffffff"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
                opacity="0.65"
              />
              <path
                d="M80 220 C130 200 230 220 300 210"
                stroke="#f8fafc"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                opacity="0.75"
              />
            </svg>
          </div>
        </section>
      </div>

      <Section
        id="vorteile"
        title="Deine Vorteile im RehaSport Zentrum"
        lead="Bewährte Konzepte, moderne Trainingsräume und ein Team mit viel Erfahrung in Orthopädie, Neurologie und Herz-Kreislauf."
      >
        <div className="grid grid--three-columns">
          {highlights.map((highlight) => (
            <Card key={highlight.title} title={highlight.title}>
              <p className="text-muted">{highlight.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        id="kurse"
        title="Beliebte Kurse"
        lead="Ein Auszug aus unserem aktuellen Kursplan. Weitere Gruppen findest du in der Kursübersicht."
      >
        <div className="grid grid--three-columns">
          {featuredCourses.map((course) => (
            <Card key={course.id} title={course.title} eyebrow={course.level} meta={course.focus}>
              <p className="text-muted">{course.description}</p>
              <div className="badge-row">
                <span className="badge">{course.schedule}</span>
                <span className="badge badge--secondary">{course.location}</span>
              </div>
              <Button to={`/kurse#${course.id}`} variant="secondary" className="mt-sm">
                Mehr erfahren
              </Button>
            </Card>
          ))}
        </div>
        <div className="text-center mt-md">
          <Button to="/kurse">Zur vollständigen Kursübersicht</Button>
        </div>
      </Section>
    </div>
  );
}

export default HomePage;
