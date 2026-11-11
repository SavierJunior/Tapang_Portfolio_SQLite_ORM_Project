import { useRef, useState } from "react";
import { contact } from "../data/portfolioData";
import { sendMessage } from "../services/portfolioService";
import { CONTACT_LIMITS, validateContactFields } from "../utils/validation";
import Button from "./common/Button";
import Reveal from "./common/Reveal";
import "../styles/Contact.css";

const emptyForm = { senderName: "", username: "", email: "", subject: "", content: "", website: "" };

// Direct messaging: visitors never register or log in. The message is saved in SQLite by the API,
// and the success notice is shown ONLY after the server confirms it was stored.
export default function Contact() {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", text }
  const submitting = useRef(false); // blocks double clicks before React re-renders

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
    if (status?.type === "success") setStatus(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;

    const found = validateContactFields(values);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus(null);
      return;
    }

    submitting.current = true;
    setSending(true);
    setStatus(null);
    try {
      await sendMessage({
        senderName: values.senderName.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        content: values.content.trim(),
        website: values.website,
      });
      setValues(emptyForm); // cleared only after a confirmed save
      setStatus({ type: "success", text: "Thank you! Your message was saved successfully. I will read it soon." });
    } catch (error) {
      // Keep everything the visitor typed so they can simply try again.
      setStatus({ type: "error", text: error.message || "Your message could not be sent. Please try again." });
    } finally {
      submitting.current = false;
      setSending(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={`contact-${name}`}>
        {label}
        {props.optional && <span className="field__optional"> (optional)</span>}
      </label>
      <input
        id={`contact-${name}`}
        name={name}
        type={props.type || "text"}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        maxLength={props.maxLength}
        value={values[name]}
        onChange={handleChange}
        disabled={sending}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `contact-${name}-error` : undefined}
      />
      {errors[name] && (
        <p className="field__error" id={`contact-${name}-error`}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <Reveal className="contact__grid">
          <div className="contact__intro">
            <p className="section-label">
              <span>07</span>Contact
            </p>
            <h2 className="contact__title">
              {contact.titleLine1}
              <br />
              {contact.titleLine2}
              <br />
              <span>{contact.titleLine3}</span>
            </h2>
            <p className="contact__description">{contact.description}</p>

            <div className="email-box">
              <small>Direct message</small>
              <strong>No account needed</strong>
              <span className="email-box__note">Write your message here and it goes straight to my portfolio inbox.</span>
              {!contact.isPlaceholder && (
                <a href={`mailto:${contact.email}`} className="email-box__mail">
                  Or email {contact.email}
                </a>
              )}
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="contact-form__row">
              {field("senderName", "Full name", { autoComplete: "name", placeholder: "Your full name", maxLength: CONTACT_LIMITS.name })}
              {field("username", "Username", { optional: true, autoComplete: "username", placeholder: "Your username", maxLength: CONTACT_LIMITS.username })}
            </div>
            {field("email", "Email address", { type: "email", autoComplete: "email", placeholder: "your@email.com", maxLength: CONTACT_LIMITS.email })}
            {field("subject", "Subject", { placeholder: "What is this about?", maxLength: CONTACT_LIMITS.subject })}

            <div className="field">
              <label htmlFor="contact-content">Message</label>
              <textarea
                id="contact-content"
                name="content"
                rows="6"
                placeholder="Write your message..."
                maxLength={CONTACT_LIMITS.content}
                value={values.content}
                onChange={handleChange}
                disabled={sending}
                aria-invalid={Boolean(errors.content)}
                aria-describedby={errors.content ? "contact-content-error" : undefined}
              />
              {errors.content && (
                <p className="field__error" id="contact-content-error">
                  {errors.content}
                </p>
              )}
            </div>

            {/* Spam trap: hidden from people, filled in by simple bots. */}
            <div className="contact-form__trap" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={handleChange} />
            </div>

            <Button type="submit" variant="primary" icon="↗" loading={sending}>
              {sending ? "Sending..." : "Send Message"}
            </Button>

            {status && (
              <p className={`form-status form-status--${status.type}`} role={status.type === "error" ? "alert" : "status"}>
                {status.text}
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
