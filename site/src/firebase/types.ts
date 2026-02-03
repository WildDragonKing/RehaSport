import { Timestamp } from "firebase/firestore";

// Basis-Typen
export interface Media {
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
}

export interface Alternative {
  title: string;
  description: string;
}

// Übungs-Detail in einer Stunde
export interface SessionExerciseDetail {
  label: string;
  value: string;
}

export interface SessionExercise {
  title: string;
  slug?: string;
  details: SessionExerciseDetail[];
}

// Phase einer Stunde
export interface SessionPhase {
  title: string;
  duration?: string;
  description?: string;
  exercises: SessionExercise[];
}

// Trainingsstunde
export interface Session {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  duration: string;
  focus?: string;
  category: string;
  categorySlug: string;
  categoryTitle?: string;
  status: "draft" | "published";
  createdBy: string;
  createdVia: "ai" | "manual" | "migration";
  phases: SessionPhase[];
  media?: Media;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Übungs-Sektion
export interface ExerciseSection {
  title: string;
  content: string;
}

// Übung aus der Bibliothek
export interface Exercise {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  area?: string;
  focus?: string;
  duration?: string;
  difficulty?: string;
  contraindications?: string[];
  kneeAlternative?: Alternative;
  shoulderAlternative?: Alternative;
  sections: ExerciseSection[];
  tags: string[];
  related?: string[];
  media?: Media;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Trainingsgruppe
export interface Group {
  id?: string;
  name: string;
  restrictions: ("knee" | "shoulder")[];
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// KI-generierter Entwurf
export interface Draft {
  id?: string;
  title: string;
  description?: string;
  duration: string;
  focus?: string;
  category: string;
  phases: SessionPhase[];
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  approvedBy?: string;
  generatedPrompt: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Benutzer
export type UserRole = "admin" | "trainer";

export interface User {
  id?: string;
  email: string;
  displayName?: string;
  role: UserRole;
  invitedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Einladung
export interface Invitation {
  id?: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  usedAt?: Timestamp;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}
