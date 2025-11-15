export interface InfoSection {
  title: string;
  body: string;
  bullets?: string[];
}

export const infoSections: InfoSection[] = [
  {
    title: "Was ist Rehabilitationssport?",
    body:
      "Rehabilitationssport ist ein ärztlich verordnetes Gruppentraining. Es unterstützt Menschen nach Verletzungen oder bei chronischen Erkrankungen dabei, dauerhaft aktiv zu bleiben und Beschwerden vorzubeugen."
  },
  {
    title: "Ablauf & Voraussetzungen",
    body:
      "Mit einer gültigen RehaSport-Verordnung (Formular 56) übernimmt die Krankenkasse in der Regel 50 Übungseinheiten innerhalb von 18 Monaten. Nach Genehmigung vereinbaren wir einen persönlichen Starttermin und wählen gemeinsam den passenden Kurs aus.",
    bullets: [
      "Kursdauer: 45 Minuten",
      "Größe: maximal 12 Teilnehmer*innen",
      "Trainer*innen mit B-Lizenz Rehabilitationssport"
    ]
  },
  {
    title: "Kosten & Verlängerung",
    body:
      "Die Teilnahme ist mit genehmigter Verordnung kostenfrei. Ohne Verordnung kannst du eine 10er-Karte erwerben oder Mitglied werden. Nach Ablauf der Verordnung beraten wir dich gern zu individuellen Anschlussangeboten."
  }
];

export const faqItems = [
  {
    question: "Brauche ich eine Überweisung?",
    answer:
      "Ja. Sprich deine Hausärztin oder deinen Orthopäden auf das Formular 56 an. Nach Genehmigung durch die Krankenkasse meldest du dich bei uns."
  },
  {
    question: "Kann ich mehrere Kurse pro Woche besuchen?",
    answer:
      "Im Rahmen der Verordnung ist ein Kurs pro Woche vorgesehen. Wenn Kapazitäten frei sind, kannst du zusätzliche Termine als Selbstzahler*in buchen."
  },
  {
    question: "Sind Schnupperstunden möglich?",
    answer:
      "Sehr gern! Wir bieten kostenfreie Kennenlerntermine an. Wähle einfach im Kontaktformular \"Schnupperstunde\" aus."
  }
] as const;
