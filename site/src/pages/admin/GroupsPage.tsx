import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";

interface Group {
  id: string;
  name: string;
  restrictions: string[];
  description?: string;
  createdBy?: string;
  createdAt?: Timestamp;
}

export default function GroupsPage(): JSX.Element {
  const { authUser } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    restrictions: [] as string[],
    description: "",
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const snapshot = await getDocs(collection(db, "groups"));
      const loadedGroups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[];
      setGroups(loadedGroups);
    } catch (error) {
      console.error("Failed to load groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || !authUser?.uid) return;

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "groups"), {
        name: newGroup.name,
        restrictions: newGroup.restrictions,
        description: newGroup.description || "",
        createdBy: authUser.uid,
        createdAt: Timestamp.now(),
      });

      const group: Group = {
        id: docRef.id,
        ...newGroup,
      };

      setGroups([...groups, group]);
      setNewGroup({ name: "", restrictions: [], description: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Fehler beim Erstellen der Gruppe");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Gruppe wirklich löschen?")) return;

    try {
      await deleteDoc(doc(db, "groups", id));
      setGroups(groups.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Failed to delete group:", error);
      alert("Fehler beim Löschen");
    }
  };

  const toggleRestriction = (restriction: string) => {
    setNewGroup((prev) => ({
      ...prev,
      restrictions: prev.restrictions.includes(restriction)
        ? prev.restrictions.filter((r) => r !== restriction)
        : [...prev.restrictions, restriction],
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 dark:text-sage-100">
            Trainingsgruppen
          </h1>
          <p className="mt-2 text-sage-600 dark:text-sage-300">
            Verwalte Gruppen mit spezifischen Einschränkungen
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg transition-colors"
        >
          + Neue Gruppe
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-sage-900 rounded-xl shadow-sm border border-sage-200 dark:border-sage-800 p-6">
          <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">
            Neue Gruppe erstellen
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2"
              >
                Gruppenname
              </label>
              <input
                id="name"
                type="text"
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-sage-300 dark:border-sage-700 rounded-lg focus:ring-2 focus:ring-sage-500 dark:bg-sage-800 dark:text-sage-100"
                placeholder="z.B. Montags-Gruppe, Senioren-Fit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
                Einschränkungen der Gruppe
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 px-4 py-2 border border-sage-200 dark:border-sage-700 rounded-lg cursor-pointer hover:bg-sage-50 dark:hover:bg-sage-800 dark:text-sage-100">
                  <input
                    type="checkbox"
                    checked={newGroup.restrictions.includes("knee")}
                    onChange={() => toggleRestriction("knee")}
                    className="text-sage-600"
                  />
                  <span>🦵 Knieprobleme</span>
                </label>
                <label className="flex items-center gap-2 px-4 py-2 border border-sage-200 dark:border-sage-700 rounded-lg cursor-pointer hover:bg-sage-50 dark:hover:bg-sage-800 dark:text-sage-100">
                  <input
                    type="checkbox"
                    checked={newGroup.restrictions.includes("shoulder")}
                    onChange={() => toggleRestriction("shoulder")}
                    className="text-sage-600"
                  />
                  <span>💪 Schulterprobleme</span>
                </label>
              </div>
              <p className="mt-2 text-xs text-sage-500 dark:text-sage-400">
                Bei diesen Einschränkungen werden automatisch Alternativen in
                den Stunden angezeigt.
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2"
              >
                Beschreibung (optional)
              </label>
              <textarea
                id="description"
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, description: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-3 border border-sage-300 dark:border-sage-700 rounded-lg focus:ring-2 focus:ring-sage-500 dark:bg-sage-800 dark:text-sage-100"
                placeholder="Notizen zur Gruppe..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateGroup}
                disabled={!newGroup.name.trim() || saving}
                className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? "Erstelle..." : "Gruppe erstellen"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sage-600 dark:text-sage-300 hover:bg-sage-100 dark:hover:bg-sage-800 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-sage-900 rounded-xl shadow-sm border border-sage-200 dark:border-sage-800 p-6"
            >
              <h3 className="text-lg font-semibold text-sage-800 dark:text-sage-100">
                {group.name}
              </h3>
              {group.description && (
                <p className="mt-1 text-sm text-sage-600 dark:text-sage-300">
                  {group.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {group.restrictions.length > 0 ? (
                  group.restrictions.map((r) => (
                    <span
                      key={r}
                      className="px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded-full"
                    >
                      {r === "knee" ? "🦵 Knie" : "💪 Schulter"}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-sage-500 dark:text-sage-400">
                    Keine Einschränkungen
                  </span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-12 bg-sage-50 dark:bg-sage-950 rounded-xl">
            <p className="text-sage-600 dark:text-sage-300">
              Noch keine Gruppen angelegt.
            </p>
            <p className="mt-2 text-sm text-sage-500 dark:text-sage-400">
              Erstelle Gruppen, um Stunden für Teilnehmer mit bestimmten
              Einschränkungen anzupassen.
            </p>
          </div>
        )
      )}
    </div>
  );
}
