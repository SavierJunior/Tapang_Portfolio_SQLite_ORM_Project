import { useCallback, useEffect, useState } from "react";
import { getProjects } from "../services/portfolioService";

// Loads the PUBLISHED projects from the API. status: "loading" | "ready" | "error"
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getProjects(controller.signal)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("The server sent an unexpected project list.");
        setProjects(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message || "Could not load projects.");
        setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  return { projects, status, error, retry };
}
