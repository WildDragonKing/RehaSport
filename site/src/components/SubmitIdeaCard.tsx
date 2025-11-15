import React from "react";
import { getStundenIdeeUrl } from "../config";

type SubmitIdeaCardProps = {
  className?: string;
};

export const SubmitIdeaCard: React.FC<SubmitIdeaCardProps> = ({ className }) => {
  const stundenIdeeUrl = getStundenIdeeUrl();

  return (
    <div className={["submit-idea-card", className].filter(Boolean).join(" ")}>
      <h2>Neue Stunden-Idee?</h2>
      <p>
        Teile dein Konzept mit der Community und reiche es direkt über unser GitHub-Issue-Formular ein.
      </p>
      <a
        className="submit-idea-card__button"
        href={stundenIdeeUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Stunden-Idee einreichen
      </a>
    </div>
  );
};

export default SubmitIdeaCard;
