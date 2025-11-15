export type ContentType = "stunde" | "übung" | "konzept";

export interface ContentEntry {
  id: string;
  type: ContentType;
  path: string;
  title: string;
  concepts: string[];
  phases: string[];
  tags: string[];
  summary?: string;
}
