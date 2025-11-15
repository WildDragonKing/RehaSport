import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent
} from "react";
import { useSearchParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Section from "../components/ui/Section";
import { courses } from "../content/courses";

type FormData = {
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const baseFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  course: "",
  message: "",
  consent: false
};

function ContactPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const presetCourse = searchParams.get("kurs");

  const defaultCourse = useMemo(() => {
    if (presetCourse && courses.some((course) => course.id === presetCourse)) {
      return presetCourse;
    }
    return "";
  }, [presetCourse]);

  const [formData, setFormData] = useState<FormData>({ ...baseFormData, course: defaultCourse });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!defaultCourse) {
      return;
    }
    setFormData((prev) => {
      if (prev.course === defaultCourse) {
        return prev;
      }
      return { ...prev, course: defaultCourse };
    });
  }, [defaultCourse]);

  const courseOptions = useMemo(() => {
    return courses.map((course) => ({ value: course.id, label: course.title }));
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = event.target;
    const { name, value } = target;
    const nextValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue
    }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = "Bitte gib deinen Namen an.";
    }
    if (!formData.email.trim()) {
      nextErrors.email = "Bitte gib eine E-Mail-Adresse an.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Diese E-Mail-Adresse wirkt nicht gültig.";
    }
    if (!formData.course.trim() && !formData.message.trim()) {
      nextErrors.course = "Wähle einen Kurs oder schreibe uns dein Anliegen.";
      nextErrors.message = "Bitte beschreibe kurz dein Ziel oder Anliegen.";
    }
    if (!formData.consent) {
      nextErrors.consent = "Bitte bestätige die Datenschutzhinweise.";
    }
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true);
      setFormData({ ...baseFormData, course: defaultCourse });
    } else {
      setSubmitted(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...baseFormData, course: defaultCourse });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div>
      <Section
        id="kontakt"
        title="Kontakt & Anmeldung"
        lead="Wir melden uns werktags innerhalb von 24 Stunden bei dir. Bitte fülle die folgenden Felder aus."
        alignment="left"
      >
        <form className="form" onSubmit={handleSubmit} onReset={handleReset} noValidate>
          <div className="form__row form__row--split">
            <label className="label" htmlFor="name">
              Name*
              <input
                id="name"
                name="name"
                className="input"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name ? (
                <span id="name-error" className="error-message">
                  {errors.name}
                </span>
              ) : null}
            </label>
            <label className="label" htmlFor="email">
              E-Mail*
              <input
                id="email"
                name="email"
                className="input"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email ? (
                <span id="email-error" className="error-message">
                  {errors.email}
                </span>
              ) : null}
            </label>
          </div>

          <label className="label" htmlFor="phone">
            Telefon (optional)
            <input
              id="phone"
              name="phone"
              className="input"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>

          <label className="label" htmlFor="course">
            Wunschkurs
            <select
              id="course"
              name="course"
              className="select"
              value={formData.course}
              onChange={handleChange}
              aria-invalid={errors.course ? "true" : "false"}
              aria-describedby={errors.course ? "course-error" : undefined}
            >
              <option value="">Ich bin noch unsicher</option>
              {courseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <option value="schnupperstunde">Schnupperstunde vereinbaren</option>
            </select>
            {errors.course ? (
              <span id="course-error" className="error-message">
                {errors.course}
              </span>
            ) : null}
          </label>

          <label className="label" htmlFor="message">
            Anliegen oder Fragen
            <textarea
              id="message"
              name="message"
              className="textarea"
              value={formData.message}
              onChange={handleChange}
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={errors.message ? "message-error" : undefined}
            />
            {errors.message ? (
              <span id="message-error" className="error-message">
                {errors.message}
              </span>
            ) : null}
          </label>

          <label className="label label--checkbox" htmlFor="consent">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={formData.consent}
              onChange={handleChange}
            />
            <span>Ich bin einverstanden, dass ihr meine Angaben zur Kontaktaufnahme nutzt und bestätige die Datenschutzbestimmungen.</span>
          </label>
          {errors.consent ? <span className="error-message">{errors.consent}</span> : null}

          <div className="hero__actions mt-md">
            <Button type="submit">Nachricht absenden</Button>
            <Button type="reset" variant="secondary">
              Formular leeren
            </Button>
          </div>

          {submitted ? (
            <p className="success-message" role="status" aria-live="polite">
              Danke für deine Anfrage! Wir melden uns schnellstmöglich bei dir.
            </p>
          ) : null}
        </form>
      </Section>
    </div>
  );
}

export default ContactPage;
