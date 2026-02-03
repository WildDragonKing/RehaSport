export interface InfoSection {
  title: string;
  body: string;
  bullets?: string[];
}

export const infoSections: InfoSection[] = [
  {
    title: "Ordner & Struktur",
    body: "Jeder Ordner entspricht einer Trainingskategorie. Die Markdown-Dateien liegen unter /stunden/<ordner> und lassen sich frei erweitern.",
    bullets: [
      "Ordnername = Kategorie in der App",
      "Dateiname wird zum Slug für die URL",
      "Sortierung erfolgt alphabetisch",
    ],
  },
  {
    title: "Markdown-Aufbau",
    body: "Titel als H1, danach die Abschnitte Beschreibung, Dauer, optional Fokus und schließlich eine nummerierte Liste der Übungen.",
    bullets: [
      "Übungen enthalten Unterlisten mit **Bezeichnern**",
      "Anerkannte Labels: Beschreibung, Dauer/Wiederholungen, Equipment, Hinweise",
      "Weitere Labels werden als freie Hinweise angezeigt",
    ],
  },
  {
    title: "Reader im Training",
    body: 'Starte die Stunde über den Button "Stunde öffnen". Über die Aktive-Übung-Steuerung navigierst du live durch den Ablauf und behältst Hinweise sichtbar.',
    bullets: [
      "Aktive Übung jederzeit wechseln",
      "Navigation mit Zurück/Weiter",
      "Gerätefreundlich im Querformat",
    ],
  },
];

export const faqItems = [
  {
    question: "Wie füge ich neue Stunden hinzu?",
    answer:
      "Lege im passenden Ordner eine neue Markdown-Datei an. Nach dem Speichern erscheint sie automatisch in der Übersicht.",
  },
  {
    question: "Welche Formatierung wird unterstützt?",
    answer:
      "Listen, Überschriften und fett formatierte Labels werden ausgewertet. Freier Fließtext bleibt ebenfalls lesbar.",
  },
  {
    question: "Kann ich den Reader offline nutzen?",
    answer:
      "Ja. Lade die Seite vor der Stunde einmal, dann bleiben Inhalte im Browser-Cache verfügbar.",
  },
] as const;
