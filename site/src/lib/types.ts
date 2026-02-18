export interface SessionExerciseDetail {
  label: string;
  value: string;
}

export interface SessionExercise {
  title: string;
  slug?: string;
  details: SessionExerciseDetail[];
}

export interface SessionPhase {
  title: string;
  description?: string;
  exercises: SessionExercise[];
}

export interface CategorySummary {
  slug: string;
  title: string;
  description?: string;
  focusTags: string[];
  sessionCount: number;
}

export interface SessionSummary {
  slug: string;
  title: string;
  description?: string;
  duration?: string;
  focus?: string;
  categorySlug: string;
  categoryTitle: string;
  exerciseCount: number;
}

export interface SessionDetail extends SessionSummary {
  phases: SessionPhase[];
  exercises: SessionExercise[];
}

export interface ExerciseSummary {
  slug: string;
  title: string;
  summary?: string;
  area?: string;
  focus?: string;
  duration?: string;
  difficulty?: string;
  tags: string[];
}

export interface ExerciseSection {
  title: string;
  content: string;
}

export interface ExerciseAlternative {
  title: string;
  description: string;
}

export interface ExerciseDetail extends ExerciseSummary {
  related: string[];
  sections: ExerciseSection[];
  kneeAlternative?: ExerciseAlternative;
  shoulderAlternative?: ExerciseAlternative;
  contraindications?: string[];
  media?: {
    videoUrl?: string;
    audioUrl?: string;
    thumbnailUrl?: string;
  };
}

export interface ContentDataset {
  categories: CategorySummary[];
  sessions: SessionDetail[];
  exercises: ExerciseDetail[];
}
