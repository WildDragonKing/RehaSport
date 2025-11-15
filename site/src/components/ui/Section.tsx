import type { ReactNode } from "react";

type SectionAlignment = "left" | "center";

interface SectionProps {
  id?: string;
  title: string;
  lead?: string;
  muted?: boolean;
  alignment?: SectionAlignment;
  contentClassName?: string;
  children: ReactNode;
}

function Section({
  id,
  title,
  lead,
  muted,
  alignment = "center",
  contentClassName,
  children
}: SectionProps): JSX.Element {
  const classes = ["section", muted ? "section--muted" : ""].filter(Boolean).join(" ");
  const headerClasses = ["section__header", alignment === "left" ? "section__header--left" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} className={classes} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="container">
        <div className={contentClassName ?? "section__content"}>
          <header className={headerClasses}>
            <h2 id={id ? `${id}-title` : undefined} className="section__title">
              {title}
            </h2>
            {lead ? <p className="section__lead">{lead}</p> : null}
          </header>
          {children}
        </div>
      </div>
    </section>
  );
}

export default Section;
