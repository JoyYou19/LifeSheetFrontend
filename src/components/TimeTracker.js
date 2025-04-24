import React, { useEffect, useState } from "react";

function TimeTracker() {
  const [session, setSession] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [optimisticStartTime, setOptimisticStartTime] = useState(null); // New state for optimistic timer

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  // Update elapsed time every second when a session is active
  useEffect(() => {
    if (optimisticStartTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - optimisticStartTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [optimisticStartTime]);

  // Convert seconds to HH:MM:SS format
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Get project name from project ID
  const getProjectName = (id) => {
    const project = projects.find((p) => p.id === id);
    return project ? project.name : "Nezināms projekts";
  };

  // Start a new session with project selection
  const startSession = async () => {
    if (!selectedProject) return alert("Please select a project!");

    const now = Date.now(); // Store as timestamp

    // Optimistic update for the timer
    setOptimisticStartTime(now);

    const optimisticSession = {
      id: now,
      startTime: now, // Store as timestamp instead of a Date object
      project_id: selectedProject,
    };
    setSession(optimisticSession);

    try {
      const response = await fetch("/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: selectedProject }),
      });

      const data = await response.json();
      // Update session with backend data, but don't use backend startTime for the timer
      setSession({
        ...data,
        startTime: new Date(data.startTime).getTime(), // Convert to timestamp
      });
    } catch (error) {
      console.error("Failed to start session:", error);
      setSession(null);
      setOptimisticStartTime(null); // Reset optimistic timer on error
    }
  };

  // End the current session
  const endSession = async () => {
    if (!session) return;

    const previousSession = session;
    setSession(null);
    setOptimisticStartTime(null); // Reset optimistic timer

    try {
      await fetch(`/end-session?id=${previousSession.id}`, { method: "POST" });
    } catch (error) {
      console.error("Failed to end session:", error);
      setSession(previousSession);
      setOptimisticStartTime(previousSession.startTime); // Restore optimistic timer on error
    }
  };

  return (
    <div className="bg-epic-darker rounded-2xl text-epic-text flex flex-col items-center p-4">
      <h2 className="text-lg font-semibold text-epic-text mb-2">Darba laiks</h2>

      <div className="flex flex-col items-center space-y-3 w-full">
        {session ? (
          <>
            <span className="text-epic-primary text-sm">
              Aktīva sesija uz projektu:{" "}
              <strong>{getProjectName(session.project_id)}</strong>
            </span>
            <span className="text-epic-primary text-lg">
              {formatTime(elapsedTime)}
            </span>
            <button
              onClick={endSession}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all"
            >
              Beigt darbu
            </button>
          </>
        ) : (
          <>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="p-2 rounded bg-epic-darker text-epic-text"
            >
              <option value="">Izvēlies projektu...</option>
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Nav projektu.
                </option>
              )}
            </select>

            {/* Start Timer Button with Hover Glow and Outline */}
            <div className="relative group w-full">
              {/* Glowing Outline */}
              <div className="absolute -inset-[6px] rounded-xl border-[3px] border-epic-primary opacity-0 scale-100 group-hover:opacity-100 transition-all duration-300"></div>

              {/* Hover Glow */}
              <div className="absolute -inset-[8px] rounded-2xl bg-epic-primary opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>

              {/* Button */}
              <button
                onClick={startSession}
                className="relative w-full bg-epic-primary text-epic-dark py-2 rounded-lg hover:bg-epic-primary-dark transition-all"
              >
                Sākt darbu
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TimeTracker;
