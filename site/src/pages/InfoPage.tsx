import { useState } from "react";

import { faqItems, infoSections } from "../content/info";

// Chevron Icon
function ChevronDownIcon(): JSX.Element {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function InfoPage(): JSX.Element {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  function toggleFaq(question: string): void {
    setOpenFaq(openFaq === question ? null : question);
  }

  return (
    <div className="container stack-lg">
      {/* Page Header */}
      <header
        className="stack-sm text-center"
        style={{ maxWidth: "640px", margin: "0 auto" }}
      >
        <h1>Über RehaSport Reader</h1>
        <p className="text-muted" style={{ fontSize: "1.125rem" }}>
          Strukturierte Trainingsstunden für Rehabilitation und
          Gesundheitssport. Alle Übungen mit sicheren Alternativen bei Knie- und
          Schulterbeschwerden.
        </p>
      </header>

      {/* 45-Minuten-Schema Infographic */}
      <section className="section" style={{ padding: "2rem 0" }}>
        <div className="section-header">
          <h2 className="section-title">Das 45-Minuten-Schema</h2>
          <p className="section-subtitle">
            Jede Trainingsstunde folgt einer bewährten Struktur für sicheres und
            effektives Training.
          </p>
        </div>

        <div className="time-infographic">
          <div className="time-bar-container">
            <div className="time-bar-segment warmup">10 min</div>
            <div className="time-bar-segment main">15 min</div>
            <div className="time-bar-segment focus">15 min</div>
            <div className="time-bar-segment cooldown">10 min</div>
          </div>
          <div className="time-legend">
            <div className="time-legend-item">
              <span className="phase-dot phase-dot-warmup" />
              <div>
                <strong>Aufwärmen</strong>
                <span
                  className="text-muted"
                  style={{ display: "block", fontSize: "0.8125rem" }}
                >
                  Mobilisation, Kreislauf aktivieren
                </span>
              </div>
            </div>
            <div className="time-legend-item">
              <span className="phase-dot phase-dot-main" />
              <div>
                <strong>Hauptteil</strong>
                <span
                  className="text-muted"
                  style={{ display: "block", fontSize: "0.8125rem" }}
                >
                  Kräftigung, funktionelle Übungen
                </span>
              </div>
            </div>
            <div className="time-legend-item">
              <span className="phase-dot phase-dot-focus" />
              <div>
                <strong>Schwerpunkt</strong>
                <span
                  className="text-muted"
                  style={{ display: "block", fontSize: "0.8125rem" }}
                >
                  Vertiefung des Stundenthemas
                </span>
              </div>
            </div>
            <div className="time-legend-item">
              <span className="phase-dot phase-dot-cooldown" />
              <div>
                <strong>Ausklang</strong>
                <span
                  className="text-muted"
                  style={{ display: "block", fontSize: "0.8125rem" }}
                >
                  Dehnung, Entspannung
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Sections Grid */}
      <section aria-label="Informationen">
        <div className="grid-sessions">
          {infoSections.map((section) => (
            <article key={section.title} className="card card-body">
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                }}
              >
                {section.title}
              </h2>
              <p
                className="text-muted"
                style={{ marginBottom: section.bullets ? "1rem" : 0 }}
              >
                {section.body}
              </p>
              {section.bullets && (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="text-muted"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span
                        className="text-primary"
                        style={{ marginTop: "0.25rem" }}
                      >
                        •
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="stack-sm" aria-label="Häufige Fragen">
        <h2 className="section-title text-center">Häufige Fragen</h2>

        <div>
          {faqItems.map((item) => (
            <div key={item.question} className="faq-item">
              <button
                type="button"
                className="faq-question"
                onClick={() => toggleFaq(item.question)}
                aria-expanded={openFaq === item.question}
              >
                <span>{item.question}</span>
                <span
                  style={{
                    transform:
                      openFaq === item.question
                        ? "rotate(180deg)"
                        : "rotate(0)",
                    transition: "transform 0.2s ease",
                    color: "var(--color-text-light)",
                  }}
                >
                  <ChevronDownIcon />
                </span>
              </button>
              {openFaq === item.question && (
                <div className="faq-answer animate-slide-down">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Info */}
      <section
        className="card card-body text-center"
        style={{ backgroundColor: "var(--color-surface-muted)" }}
      >
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          Open Source
        </h2>
        <p className="text-muted" style={{ marginBottom: "1rem" }}>
          RehaSport Reader ist ein offenes Projekt. Feedback und Beiträge sind
          willkommen.
        </p>
        <a
          href="https://github.com/WildDragonKing/RehaSport"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          Auf GitHub ansehen
        </a>
      </section>
    </div>
  );
}

export default InfoPage;
