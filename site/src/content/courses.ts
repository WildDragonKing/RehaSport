export interface Course {
  id: string;
  title: string;
  focus: string;
  level: "Einsteiger" | "Aufbau" | "Fortgeschritten";
  description: string;
  schedule: string;
  location: string;
  trainer: string;
  slots: number;
  equipment: string;
}

export const courses: Course[] = [
  {
    id: "ruecken-entspannung",
    title: "Rückenfit & Entspannung",
    focus: "Wirbelsäule, Mobilisation, Atmung",
    level: "Einsteiger",
    description:
      "Sanfte Mobilisationsübungen und Atemtechniken zur Entlastung der Wirbelsäule. Ideal für den Einstieg nach längerer Pause oder bei sitzender Tätigkeit.",
    schedule: "Montag · 17:00 – 17:45 Uhr",
    location: "Studio Nord · Kursraum 1",
    trainer: "Svenja Krauß",
    slots: 4,
    equipment: "Gymnastikmatte, Pezziball"
  },
  {
    id: "schulter-stabil",
    title: "Schulter & Nacken stabil",
    focus: "Schultergürtel, Haltung, Kraftausdauer",
    level: "Einsteiger",
    description:
      "Kräftigung der Schulter- und Nackenmuskulatur mit Theraband und leichten Gewichten. Unterstützt eine aufrechte Haltung im Alltag.",
    schedule: "Dienstag · 09:30 – 10:15 Uhr",
    location: "Gesundheitszentrum Mitte · Saal 2",
    trainer: "Markus Behr",
    slots: 2,
    equipment: "Theraband, leichte Kurzhanteln"
  },
  {
    id: "knie-aufbau",
    title: "Knieaufbau Aktiv",
    focus: "Beinkraft, Stabilität, Gleichgewicht",
    level: "Aufbau",
    description:
      "Gezielte Kräftigung für Knie und Hüfte nach Operationen oder Verletzungen. Der Kurs verbindet Balanceübungen mit funktionellem Krafttraining.",
    schedule: "Mittwoch · 18:30 – 19:15 Uhr",
    location: "Praxis Süd · Bewegungsraum",
    trainer: "Laura Nguyen",
    slots: 6,
    equipment: "Step-Brett, Miniband"
  },
  {
    id: "herz-kreislauf",
    title: "Cardio Sanft",
    focus: "Herz-Kreislauf, Ausdauer, Koordination",
    level: "Aufbau",
    description:
      "Abwechslungsreiche Ausdauerintervalle mit geringer Belastung. Perfekt für Teilnehmer*innen mit Herz-Kreislauf-Erkrankungen, die kontrolliert aktiv werden möchten.",
    schedule: "Donnerstag · 11:00 – 11:45 Uhr",
    location: "Sportpark West · Kursfläche",
    trainer: "Nina Albrecht",
    slots: 3,
    equipment: "Step-Brett, Softbälle"
  },
  {
    id: "core-power",
    title: "Core & Balance",
    focus: "Rumpfstabilität, Gleichgewicht, Tiefenmuskulatur",
    level: "Fortgeschritten",
    description:
      "Ganzkörperprogramm mit Fokus auf stabilisierende Tiefenmuskeln. Für Teilnehmer*innen, die bereits Grundlagenkurse absolviert haben.",
    schedule: "Freitag · 16:15 – 17:00 Uhr",
    location: "Studio Nord · Kursraum 2",
    trainer: "Alexandra Wolf",
    slots: 5,
    equipment: "Balance-Pad, Faszienrolle"
  },
  {
    id: "arthrose-mobil",
    title: "Arthrose Mobil",
    focus: "Gelenkschonende Mobilisation, Alltagstraining",
    level: "Einsteiger",
    description:
      "Ruhige Einheit mit alltagsnahen Bewegungsabläufen. Vermittelt Strategien gegen Steifheit und Schmerzen bei Arthrose.",
    schedule: "Samstag · 10:00 – 10:45 Uhr",
    location: "Reha-Praxis Zentrum · Saal Bewegung",
    trainer: "Dr. Jana Ritter",
    slots: 1,
    equipment: "Stuhl, Theraband"
  }
];
