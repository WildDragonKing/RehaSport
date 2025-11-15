export const DEFAULT_REPO_BASE_URL = "https://raw.githubusercontent.com/<OWNER>/RehaSport/main/";

export const REPO_BASE_URL =
  (import.meta.env?.VITE_REPO_BASE_URL as string | undefined)?.replace(/\/?$/, "/") ?? DEFAULT_REPO_BASE_URL;
export const github = {
  /**
   * Besitzer:in des GitHub-Repositories. Kann über VITE_GITHUB_OWNER überschrieben werden.
   */
  owner: (import.meta.env?.VITE_GITHUB_OWNER as string | undefined) ?? "OWNER_PLACEHOLDER",
  /**
   * Repository-Name. Kann über VITE_GITHUB_REPO überschrieben werden.
   */
  repo: (import.meta.env?.VITE_GITHUB_REPO as string | undefined) ?? "RehaSport",
};

export const getStundenIdeeUrl = () =>
  `https://github.com/${github.owner}/${github.repo}/issues/new?template=stunden-idee.yml`;
