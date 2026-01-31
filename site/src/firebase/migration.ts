import { collection, getDocs, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { db } from './config';
import type { Session, Exercise } from './types';

// Import the existing content loaders for migration
import { getAllSessions, categories } from '../content/sessions';
import { exercises as localExercises, type ExerciseMeta } from '../content/exercises';
import { toString } from 'mdast-util-to-string';

const BATCH_SIZE = 500; // Firestore batch limit

export interface MigrationResult {
  sessions: number;
  exercises: number;
  errors: string[];
}

/**
 * Check if Firestore already has data
 */
export async function hasFirestoreData(): Promise<{ sessions: number; exercises: number }> {
  const sessionsSnap = await getDocs(collection(db, 'sessions'));
  const exercisesSnap = await getDocs(collection(db, 'exercises'));
  return {
    sessions: sessionsSnap.size,
    exercises: exercisesSnap.size,
  };
}

/**
 * Migrate all sessions from local Markdown files to Firestore
 */
export async function migrateSessions(userId: string): Promise<{ count: number; errors: string[] }> {
  const localSessions = getAllSessions();
  const errors: string[] = [];
  let count = 0;

  // Process in batches
  for (let i = 0; i < localSessions.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchSessions = localSessions.slice(i, i + BATCH_SIZE);

    for (const session of batchSessions) {
      try {
        // Create a unique ID from category and slug
        const sessionId = `${session.categorySlug}_${session.slug}`;
        const sessionRef = doc(collection(db, 'sessions'), sessionId);

        const sessionData: Omit<Session, 'id'> = {
          title: session.title,
          description: session.description,
          duration: session.duration || '45 Minuten',
          focus: session.focus,
          category: session.categorySlug,
          categoryTitle: session.categoryTitle,
          status: 'published',
          createdBy: userId,
          createdVia: 'migration',
          phases: session.phases.map(phase => ({
            title: phase.title,
            description: phase.description,
            duration: extractDuration(phase.title),
            exercises: phase.exercises.map(ex => ({
              title: ex.title,
              details: ex.details,
            })),
          })),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        batch.set(sessionRef, sessionData);
        count++;
      } catch (error) {
        errors.push(`Session ${session.slug}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    }

    await batch.commit();
  }

  return { count, errors };
}

/**
 * Convert exercise sections from AST nodes to plain text
 */
function convertSections(sections: ExerciseMeta['sections']): Array<{ title: string; content: string }> {
  return sections.map(s => ({
    title: s.title,
    content: s.nodes.map(node => toString(node)).join('\n').trim(),
  }));
}

/**
 * Migrate all exercises from local Markdown files to Firestore
 */
export async function migrateExercises(userId: string): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  // Filter out index files and invalid exercises
  const validExercises = localExercises.filter(exercise => {
    // Skip index files and files without required fields
    if (!exercise.slug || exercise.slug.toUpperCase().includes('INDEX')) {
      return false;
    }
    if (!exercise.title || !exercise.summary) {
      return false;
    }
    return true;
  });

  // Process in batches
  for (let i = 0; i < validExercises.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchExercises = validExercises.slice(i, i + BATCH_SIZE);

    for (const exercise of batchExercises) {
      try {
        const exerciseRef = doc(collection(db, 'exercises'), exercise.slug);

        // Convert sections from AST nodes to plain text
        const convertedSections = convertSections(exercise.sections);

        // Extract knee and shoulder alternatives from sections
        const kneeAlt = extractAlternative(convertedSections, 'knie');
        const shoulderAlt = extractAlternative(convertedSections, 'schulter');
        const contraindications = extractContraindications(convertedSections);

        // Build exercise data, ensuring no undefined values
        const exerciseData: Omit<Exercise, 'id'> = {
          title: exercise.title,
          slug: exercise.slug,
          summary: exercise.summary || '',
          area: exercise.area || '',
          focus: exercise.focus || '',
          duration: exercise.duration || '',
          difficulty: exercise.difficulty || '',
          contraindications: contraindications || [],
          kneeAlternative: kneeAlt || undefined,
          shoulderAlternative: shoulderAlt || undefined,
          sections: convertedSections || [],
          tags: exercise.tags || [],
          related: exercise.related || [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        batch.set(exerciseRef, exerciseData);
        count++;
      } catch (error) {
        errors.push(`Exercise ${exercise.slug}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    }

    await batch.commit();
  }

  return { count, errors };
}

/**
 * Run full migration
 */
export async function migrateAll(userId: string): Promise<MigrationResult> {
  const sessionsResult = await migrateSessions(userId);
  const exercisesResult = await migrateExercises(userId);

  return {
    sessions: sessionsResult.count,
    exercises: exercisesResult.count,
    errors: [...sessionsResult.errors, ...exercisesResult.errors],
  };
}

// Helper functions

function extractDuration(phaseTitle: string): string | undefined {
  const match = phaseTitle.match(/\((\d+)\s*(?:Min(?:uten)?|min)\)/i);
  return match ? `${match[1]} Minuten` : undefined;
}

function extractAlternative(
  sections: Array<{ title: string; content: string }>,
  type: 'knie' | 'schulter'
): { title: string; description: string } | undefined {
  const altSection = sections.find(s =>
    s.title.toLowerCase().includes(type) ||
    s.title.toLowerCase().includes('alternative')
  );

  if (!altSection) return undefined;

  // Look for the specific alternative in the content
  const lines = altSection.content.split('\n');
  const typeKeyword = type === 'knie' ? 'knie' : 'schulter';

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(typeKeyword)) {
      const title = lines[i].replace(/^[#\-*]+\s*/, '').trim();
      const description = lines.slice(i + 1).join('\n').trim().split('\n\n')[0];
      return { title, description };
    }
  }

  return undefined;
}

function extractContraindications(
  sections: Array<{ title: string; content: string }>
): string[] {
  const contraSection = sections.find(s =>
    s.title.toLowerCase().includes('kontraindikation') ||
    s.title.toLowerCase().includes('nicht geeignet')
  );

  if (!contraSection) return [];

  return contraSection.content
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map(line => line.replace(/^[\-*]\s*/, '').trim())
    .filter(Boolean);
}
