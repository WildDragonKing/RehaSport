export const DEFAULT_REPO_BASE_URL = "https://raw.githubusercontent.com/<OWNER>/RehaSport/main/";

export const REPO_BASE_URL =
  (import.meta.env?.VITE_REPO_BASE_URL as string | undefined)?.replace(/\/?$/, "/") ?? DEFAULT_REPO_BASE_URL;
