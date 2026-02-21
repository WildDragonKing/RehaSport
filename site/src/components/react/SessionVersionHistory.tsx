import { useCallback, useEffect, useState, type ReactElement } from "react";

import { getSessionVersions, restoreVersion } from "../../lib/session-service";
import type { SessionVersion } from "../../lib/types";
import { useAuth } from "../../lib/use-auth";

interface Props {
  sessionFirestoreId: string;
}

export default function SessionVersionHistory({
  sessionFirestoreId,
}: Props): ReactElement | null {
  const auth = useAuth();
  const [versions, setVersions] = useState<SessionVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSessionVersions(sessionFirestoreId);
      setVersions(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Versionen konnten nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }, [sessionFirestoreId]);

  useEffect(() => {
    if (open && auth.status === "signed-in") {
      loadVersions();
    }
  }, [open, auth.status, loadVersions]);

  // Nur fuer eingeloggte User sichtbar
  if (auth.status !== "signed-in") {
    return null;
  }

  async function handleRestore(version: SessionVersion): Promise<void> {
    if (auth.status !== "signed-in") return;

    const confirmed = window.confirm(
      `Version ${version.versionNumber} wiederherstellen? Der aktuelle Stand wird vorher als Backup gesichert.`,
    );
    if (!confirmed) return;

    setRestoring(version.id);
    setError(null);
    try {
      await restoreVersion(
        sessionFirestoreId,
        version,
        auth.user.uid,
        auth.user.displayName ?? "Unbekannt",
      );
      // Seite neu laden um aktualisierte Session anzuzeigen
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Wiederherstellung fehlgeschlagen.",
      );
      setRestoring(null);
    }
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <details
      className="card version-history"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="version-history-summary">
        <span>Aenderungs-Historie</span>
        <span className="exercise-expand-icon" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="version-history-body stack">
        {loading ? (
          <div className="empty">Lade Versionen …</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : versions.length === 0 ? (
          <div className="empty">Keine frueheren Versionen vorhanden.</div>
        ) : (
          <ul className="version-list stack">
            {versions.map((version) => (
              <li key={version.id} className="version-item card">
                <div className="version-item-header">
                  <strong>Version {version.versionNumber}</strong>
                  <span className="muted">{formatDate(version.changedAt)}</span>
                </div>
                <p className="version-item-note">{version.changeNote}</p>
                {version.changedByName ? (
                  <span className="muted version-item-author">
                    von {version.changedByName}
                  </span>
                ) : null}
                <div className="version-item-meta">
                  <span className="badge">
                    {version.snapshot.phases.length} Phasen
                  </span>
                  <span className="badge">
                    {version.snapshot.phases.reduce(
                      (sum, p) => sum + (p.exercises?.length ?? 0),
                      0,
                    )}{" "}
                    Uebungen
                  </span>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleRestore(version)}
                  disabled={restoring !== null}
                  type="button"
                >
                  {restoring === version.id
                    ? "Wird wiederhergestellt …"
                    : "Wiederherstellen"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
