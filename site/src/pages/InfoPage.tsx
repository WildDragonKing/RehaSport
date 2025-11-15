import { faqItems, infoSections } from "../content/info";

function InfoPage(): JSX.Element {
  return (
    <div className="container stack">
      <header className="page-header">
        <p className="page-eyebrow">Reader Leitfaden</p>
        <h1>Hinweise zur Nutzung</h1>
        <p className="page-lead">
          So pflegst du neue Stunden ein und nutzt den Reader im Training. Alle Inhalte stammen direkt aus den Markdown-Dateien
          im Projekt.
        </p>
      </header>

      <section className="info-grid" aria-label="Grundlagen">
        {infoSections.map((section) => (
          <article key={section.title} className="info-card">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            {section.bullets ? (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <section className="faq-list" aria-label="FAQ">
        <h2>Häufige Fragen</h2>
        <div>
          {faqItems.map((item) => (
            <article key={item.question} className="faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default InfoPage;
