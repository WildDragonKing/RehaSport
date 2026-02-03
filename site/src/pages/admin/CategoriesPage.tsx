import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import { useContent } from "../../contexts/ContentContext";
import { seedCategoriesFromSessions } from "../../firebase/seed-categories";

interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  createdAt: number;
}

export default function CategoriesPage(): JSX.Element {
  const { isAdmin } = useAuth();
  const { refresh } = useContent();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
  });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    created: string[];
    existing: string[];
    errors: string[];
  } | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const cats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      cats.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setSaving(true);
    try {
      const slug = formData.slug || generateSlug(formData.title);

      if (editingId) {
        await updateDoc(doc(db, "categories", editingId), {
          title: formData.title,
          description: formData.description,
          slug,
          updatedAt: Date.now(),
        });
      } else {
        await addDoc(collection(db, "categories"), {
          title: formData.title,
          description: formData.description,
          slug,
          order: categories.length,
          createdAt: Date.now(),
        });
      }

      setFormData({ title: "", description: "", slug: "" });
      setEditingId(null);
      await loadCategories();
      await refresh();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      title: category.title,
      description: category.description || "",
      slug: category.slug,
    });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Kategorie wirklich löschen? Zugehörige Stunden werden NICHT gelöscht.",
      )
    )
      return;

    try {
      await deleteDoc(doc(db, "categories", id));
      await loadCategories();
      await refresh();
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Fehler beim Löschen");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", slug: "" });
  };

  const handleSeedFromSessions = async () => {
    if (
      !confirm(
        "Kategorien aus vorhandenen Stunden erstellen? Bestehende Kategorien werden nicht überschrieben.",
      )
    ) {
      return;
    }

    setSeeding(true);
    setSeedResult(null);

    try {
      const result = await seedCategoriesFromSessions();
      setSeedResult(result);
      await loadCategories();
      await refresh();
    } catch (error) {
      console.error("Failed to seed categories:", error);
      alert("Fehler beim Erstellen der Kategorien");
    } finally {
      setSeeding(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600">
          Nur Administratoren können Kategorien verwalten.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900">
            Kategorien
          </h1>
          <p className="mt-2 text-sage-600">
            Verwalte die Kategorien für Trainingsstunden
          </p>
        </div>
        <button
          onClick={handleSeedFromSessions}
          disabled={seeding}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {seeding ? "Erstelle..." : "Aus Stunden generieren"}
        </button>
      </div>

      {seedResult && (
        <div
          className={`p-4 rounded-lg ${seedResult.errors.length > 0 ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"}`}
        >
          <p className="font-medium text-sage-800">
            {seedResult.created.length > 0
              ? `${seedResult.created.length} Kategorien erstellt: ${seedResult.created.join(", ")}`
              : "Keine neuen Kategorien erstellt"}
          </p>
          {seedResult.existing.length > 0 && (
            <p className="text-sm text-sage-600 mt-1">
              Bereits vorhanden: {seedResult.existing.join(", ")}
            </p>
          )}
          {seedResult.errors.length > 0 && (
            <p className="text-sm text-red-600 mt-1">
              Fehler: {seedResult.errors.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">
          {editingId ? "Kategorie bearbeiten" : "Neue Kategorie"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Titel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder={
                  formData.title
                    ? generateSlug(formData.title)
                    : "automatisch generiert"
                }
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !formData.title}
              className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {saving
                ? "Speichern..."
                : editingId
                  ? "Aktualisieren"
                  : "Hinzufügen"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-700 font-medium rounded-lg transition-colors"
              >
                Abbrechen
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-200 overflow-hidden">
        <div className="px-6 py-4 bg-sage-50 border-b border-sage-200">
          <h2 className="text-lg font-semibold text-sage-800">
            Vorhandene Kategorien ({categories.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-sage-500">Lädt...</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-sage-500">
            Noch keine Kategorien vorhanden.
          </div>
        ) : (
          <div className="divide-y divide-sage-100">
            {categories.map((category) => (
              <div
                key={category.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-sage-50"
              >
                <div>
                  <h3 className="font-medium text-sage-800">
                    {category.title}
                  </h3>
                  <p className="text-sm text-sage-500">
                    /{category.slug}
                    {category.description && ` • ${category.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-sage-500 hover:text-sage-700 transition-colors"
                    title="Bearbeiten"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    title="Löschen"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
