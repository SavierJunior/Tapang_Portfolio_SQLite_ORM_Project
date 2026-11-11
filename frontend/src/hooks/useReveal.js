import { useEffect, useRef, useState } from "react";

// Returns [ref, visible]. `visible` becomes true once the element scrolls into view.
// Falls back to visible when IntersectionObserver is missing or the user prefers reduced motion.
export function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!element || reduceMotion || !("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}
