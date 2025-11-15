import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import { faqItems, infoSections } from "../content/info";

function InfoPage(): JSX.Element {
  return (
    <div>
      <Section
        id="ueber-rehasport"
        title="Alles Wichtige über RehaSport"
        lead="Hier findest du Antworten auf häufige Fragen rund um Verordnung, Ablauf und Finanzierung."
        alignment="left"
      >
        <div className="grid grid--two-columns">
          {infoSections.map((section) => (
            <Card key={section.title} title={section.title}>
              <p className="text-muted">{section.body}</p>
              {section.bullets ? (
                <ul className="info-list">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </Card>
          ))}
        </div>
      </Section>

      <Section
        id="faq"
        title="Häufige Fragen"
        lead="Noch unsicher? Unsere FAQ geben dir einen schnellen Überblick."
        alignment="left"
        muted
      >
        <div className="faq" role="list">
          {faqItems.map((item) => (
            <div key={item.question} className="faq__item" role="listitem">
              <h3>{item.question}</h3>
              <p className="text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export default InfoPage;
