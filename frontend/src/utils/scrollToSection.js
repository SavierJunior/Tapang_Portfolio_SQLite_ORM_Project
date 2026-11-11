// Smoothly scroll to a section id (CSS scroll-margin-top keeps it clear of the fixed navbar).
export function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}
