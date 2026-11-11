const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value).trim());
}

// ---------- Contact form (the server validates again; this just gives instant feedback) ----------
export const CONTACT_LIMITS = { name: 120, username: 60, email: 191, subject: 200, content: 5000 };

export function validateContactFields({ senderName, username, email, subject, content }) {
  const errors = {};
  if (!senderName.trim()) errors.senderName = "Enter your full name.";
  else if (senderName.trim().length > CONTACT_LIMITS.name) errors.senderName = `Use ${CONTACT_LIMITS.name} characters or fewer.`;
  if (username.trim().length > CONTACT_LIMITS.username) errors.username = `Use ${CONTACT_LIMITS.username} characters or fewer.`;
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!subject.trim()) errors.subject = "Enter a subject.";
  else if (subject.trim().length < 3) errors.subject = "The subject needs at least 3 characters.";
  else if (subject.trim().length > CONTACT_LIMITS.subject) errors.subject = `Use ${CONTACT_LIMITS.subject} characters or fewer.`;
  if (!content.trim()) errors.content = "Write a message.";
  else if (content.trim().length < 5) errors.content = "The message needs at least 5 characters.";
  else if (content.trim().length > CONTACT_LIMITS.content) errors.content = `Use ${CONTACT_LIMITS.content} characters or fewer.`;
  return errors;
}
