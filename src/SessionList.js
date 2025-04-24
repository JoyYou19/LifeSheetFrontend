import { useState } from "react";

// Helper function to format the date
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

// Helper function to format the duration
const formatDuration = (duration) => {
  const ms = duration.match(/(\d+)\.\d+s/)[1] * 1000; // Convert seconds to milliseconds
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes} min ${seconds} sec`;
};

// SessionList Component for fetching and displaying all sessions
function SessionList() {
  const [sessions, setSessions] = useState([]); // Initialize sessions as an empty array

  // Fetch all work sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch("/sessions");
      const data = await response.json();
      setSessions(data); // Update the state with the fetched sessions
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={fetchSessions}
        className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
      >
        Parādīt pabeigtos darbus
      </button>

      <ul className="mt-4 space-y-2">
        {sessions.length === 0 ? (
          <p className="text-white">Nav neviena darba.</p>
        ) : (
          sessions.map((s) => (
            <li
              key={s.id}
              className="p-3 bg-black rounded-lg shadow-sm flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">#{s.id}</span>
                <i className="fas fa-clock text-white"></i>
                <span className="text-sm text-white">
                  {formatDate(s.start_time)}
                </span>
              </div>

              {s.end_time && (
                <div className="flex items-center space-x-2 text-white">
                  <i className="fas fa-check-circle text-white"></i>
                  <span className="text-sm">{formatDate(s.end_time)}</span>
                </div>
              )}

              {s.duration && (
                <div className="flex items-center space-x-2 text-white">
                  <i className="fas fa-hourglass-half text-white"></i>
                  <span className="text-sm">{formatDuration(s.duration)}</span>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default SessionList;
