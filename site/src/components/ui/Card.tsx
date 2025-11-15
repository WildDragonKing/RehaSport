import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  eyebrow?: string;
  meta?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

function Card({ title, eyebrow, meta, children, className, footer }: CardProps): JSX.Element {
  const classes = ["card"];
  if (className) {
    classes.push(className);
  }

  return (
    <article className={classes.join(" ")}>
      {eyebrow ? <span className="badge badge--secondary">{eyebrow}</span> : null}
      {title ? <h3 className="card__title">{title}</h3> : null}
      {meta ? <p className="card__meta">{meta}</p> : null}
      <div>{children}</div>
      {footer ? <div className="card__footer">{footer}</div> : null}
    </article>
  );
}

export default Card;
