export const github = {
  /**
   * Besitzer:in des GitHub-Repositories. Kann über NEXT_PUBLIC_GITHUB_OWNER überschrieben werden.
   */
  owner: process.env.NEXT_PUBLIC_GITHUB_OWNER ?? "OWNER_PLACEHOLDER",
  /**
   * Repository-Name. Kann über NEXT_PUBLIC_GITHUB_REPO überschrieben werden.
   */
  repo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "RehaSport",
};

export const getStundenIdeeUrl = () =>
  `https://github.com/${github.owner}/${github.repo}/issues/new?template=stunden-idee.yml`;
