import type { Course } from "../../content/courses";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface CourseCardProps {
  course: Course;
}

function CourseCard({ course }: CourseCardProps): JSX.Element {
  const { id, title, focus, level, description, schedule, location, trainer, slots, equipment } = course;
  return (
    <Card title={title} eyebrow={level} meta={focus}>
      <p className="text-muted">{description}</p>
      <dl className="data-list" aria-label={`Rahmendaten zu ${title}`}>
        <div>
          <dt>Zeiten</dt>
          <dd>{schedule}</dd>
        </div>
        <div>
          <dt>Ort</dt>
          <dd>{location}</dd>
        </div>
        <div>
          <dt>Trainer*in</dt>
          <dd>{trainer}</dd>
        </div>
        <div>
          <dt>Empfohlenes Equipment</dt>
          <dd>{equipment}</dd>
        </div>
      </dl>
      <div className="badge-row mt-sm">
        <span className="badge badge--accent">{slots > 0 ? `${slots} freie Plätze` : "Warteliste"}</span>
      </div>
      <div className="hero__actions mt-sm">
        <Button to={`/kontakt?kurs=${id}`} aria-label={`Kontakt für Kurs ${title}`}>
          Platz anfragen
        </Button>
      </div>
    </Card>
  );
}

export default CourseCard;
