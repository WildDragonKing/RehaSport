import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';

interface Exercise {
  id: string;
  slug: string;
  title: string;
  summary: string;
  area: string;
  focus: string;
  difficulty: string;
  contraindications: string[];
  kneeAlternative?: { title: string; description: string };
  shoulderAlternative?: { title: string; description: string };
  sections: { title: string; content: string }[];
  tags: string[];
  createdBy: string;
  createdAt: number;
}

const DIFFICULTY_OPTIONS = ['Leicht', 'Mittel', 'Schwer'];
const AREA_OPTIONS = ['Ganzkörper', 'Oberkörper', 'Unterkörper', 'Rumpf', 'Arme', 'Beine', 'Rücken', 'Schultern'];

export default function ExercisesManagePage(): JSX.Element {
  const { user, isAdmin, isTrainer } = useAuth();
  const { refresh } = useContent();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    area: '',
    focus: '',
    difficulty: 'Mittel',
    contraindications: '',
    kneeAltTitle: '',
    kneeAltDesc: '',
    shoulderAltTitle: '',
    shoulderAltDesc: '',
    execution: '',
    tips: '',
    tags: '',
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'exercises'));
      const exs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
      exs.sort((a, b) => a.title.localeCompare(b.title, 'de'));
      setExercises(exs);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    try {
      const slug = formData.slug || generateSlug(formData.title);
      const contraindications = formData.contraindications
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const sections = [];
      if (formData.execution) {
        sections.push({ title: 'Ausführung', content: formData.execution });
      }
      if (formData.tips) {
        sections.push({ title: 'Tipps', content: formData.tips });
      }

      const exerciseData: Omit<Exercise, 'id'> = {
        title: formData.title,
        slug,
        summary: formData.summary,
        area: formData.area,
        focus: formData.focus,
        difficulty: formData.difficulty,
        contraindications,
        sections,
        tags,
        createdBy: user.id,
        createdAt: Date.now(),
      };

      if (formData.kneeAltTitle) {
        exerciseData.kneeAlternative = {
          title: formData.kneeAltTitle,
          description: formData.kneeAltDesc,
        };
      }

      if (formData.shoulderAltTitle) {
        exerciseData.shoulderAlternative = {
          title: formData.shoulderAltTitle,
          description: formData.shoulderAltDesc,
        };
      }

      if (editingId) {
        await updateDoc(doc(db, 'exercises', editingId), {
          ...exerciseData,
          updatedAt: Date.now(),
        });
      } else {
        await addDoc(collection(db, 'exercises'), exerciseData);
      }

      resetForm();
      await loadExercises();
      await refresh();
    } catch (error) {
      console.error('Failed to save exercise:', error);
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setFormData({
      title: exercise.title,
      slug: exercise.slug,
      summary: exercise.summary || '',
      area: exercise.area || '',
      focus: exercise.focus || '',
      difficulty: exercise.difficulty || 'Mittel',
      contraindications: exercise.contraindications?.join(', ') || '',
      kneeAltTitle: exercise.kneeAlternative?.title || '',
      kneeAltDesc: exercise.kneeAlternative?.description || '',
      shoulderAltTitle: exercise.shoulderAlternative?.title || '',
      shoulderAltDesc: exercise.shoulderAlternative?.description || '',
      execution: exercise.sections?.find(s => s.title === 'Ausführung')?.content || '',
      tips: exercise.sections?.find(s => s.title === 'Tipps')?.content || '',
      tags: exercise.tags?.join(', ') || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert('Nur Administratoren können Übungen löschen.');
      return;
    }
    if (!confirm('Übung wirklich löschen?')) return;

    try {
      await deleteDoc(doc(db, 'exercises', id));
      await loadExercises();
      await refresh();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      alert('Fehler beim Löschen');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      title: '',
      slug: '',
      summary: '',
      area: '',
      focus: '',
      difficulty: 'Mittel',
      contraindications: '',
      kneeAltTitle: '',
      kneeAltDesc: '',
      shoulderAltTitle: '',
      shoulderAltDesc: '',
      execution: '',
      tips: '',
      tags: '',
    });
  };

  const filteredExercises = exercises.filter(ex =>
    ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isTrainer) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600">Nur Trainer können Übungen verwalten.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900">Übungen</h1>
          <p className="mt-2 text-sage-600">Verwalte die Übungsbibliothek</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Abbrechen' : '+ Neue Übung'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
          <h2 className="text-lg font-semibold text-sage-900 mb-4">
            {editingId ? 'Übung bearbeiten' : 'Neue Übung erstellen'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Titel *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder={formData.title ? generateSlug(formData.title) : 'automatisch'}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Kurzbeschreibung *</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Körperbereich</label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                >
                  <option value="">Auswählen...</option>
                  {AREA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Schwerpunkt</label>
                <input
                  type="text"
                  value={formData.focus}
                  onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                  placeholder="z.B. Kraft, Beweglichkeit"
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Schwierigkeit</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                >
                  {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Ausführung</label>
              <textarea
                value={formData.execution}
                onChange={(e) => setFormData({ ...formData, execution: e.target.value })}
                rows={4}
                placeholder="Beschreibe die Ausführung der Übung..."
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Tipps</label>
              <textarea
                value={formData.tips}
                onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                rows={2}
                placeholder="Zusätzliche Tipps..."
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Kontraindikationen (kommagetrennt)
              </label>
              <input
                type="text"
                value={formData.contraindications}
                onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
                placeholder="z.B. Knieprobleme, Bluthochdruck"
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
              />
            </div>

            {/* Alternatives */}
            <div className="border-t border-sage-200 pt-4">
              <h3 className="font-medium text-sage-800 mb-3">Alternativen bei Einschränkungen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 mb-2">🦵 Knie-Alternative</p>
                  <input
                    type="text"
                    value={formData.kneeAltTitle}
                    onChange={(e) => setFormData({ ...formData, kneeAltTitle: e.target.value })}
                    placeholder="Titel der Alternative"
                    className="w-full px-3 py-2 mb-2 border border-amber-200 rounded-lg text-sm"
                  />
                  <textarea
                    value={formData.kneeAltDesc}
                    onChange={(e) => setFormData({ ...formData, kneeAltDesc: e.target.value })}
                    placeholder="Beschreibung..."
                    rows={2}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">💪 Schulter-Alternative</p>
                  <input
                    type="text"
                    value={formData.shoulderAltTitle}
                    onChange={(e) => setFormData({ ...formData, shoulderAltTitle: e.target.value })}
                    placeholder="Titel der Alternative"
                    className="w-full px-3 py-2 mb-2 border border-blue-200 rounded-lg text-sm"
                  />
                  <textarea
                    value={formData.shoulderAltDesc}
                    onChange={(e) => setFormData({ ...formData, shoulderAltDesc: e.target.value })}
                    placeholder="Beschreibung..."
                    rows={2}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Tags (kommagetrennt)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="z.B. Aufwärmen, Dehnung, Stuhl"
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !formData.title || !formData.summary}
                className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? 'Speichern...' : editingId ? 'Aktualisieren' : 'Erstellen'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-700 font-medium rounded-lg transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Übungen suchen..."
          className="w-full md:w-96 px-4 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
        />
      </div>

      {/* Exercises List */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-200 overflow-hidden">
        <div className="px-6 py-4 bg-sage-50 border-b border-sage-200">
          <h2 className="text-lg font-semibold text-sage-800">
            Übungsbibliothek ({filteredExercises.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-sage-500">Lädt...</div>
        ) : filteredExercises.length === 0 ? (
          <div className="p-6 text-center text-sage-500">
            {searchTerm ? 'Keine Übungen gefunden.' : 'Noch keine Übungen vorhanden.'}
          </div>
        ) : (
          <div className="divide-y divide-sage-100">
            {filteredExercises.map((exercise) => (
              <div key={exercise.id} className="px-6 py-4 flex items-center justify-between hover:bg-sage-50">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sage-800 truncate">{exercise.title}</h3>
                  <p className="text-sm text-sage-500 truncate">
                    {exercise.area && `${exercise.area} • `}
                    {exercise.difficulty}
                    {exercise.tags?.length > 0 && ` • ${exercise.tags.slice(0, 3).join(', ')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {exercise.kneeAlternative && (
                    <span title="Hat Knie-Alternative" className="text-amber-500">🦵</span>
                  )}
                  {exercise.shoulderAlternative && (
                    <span title="Hat Schulter-Alternative" className="text-blue-500">💪</span>
                  )}
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="p-2 text-sage-500 hover:text-sage-700 transition-colors"
                    title="Bearbeiten"
                  >
                    ✏️
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
