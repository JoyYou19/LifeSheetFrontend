import React, { useEffect, useState } from "react";

const TodaySequence = () => {
  const [sequence, setSequence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch today's sequence from the backend
  useEffect(() => {
    const fetchTodaySequence = async () => {
      try {
        const response = await fetch("/today-sequence");
        if (!response.ok) {
          throw new Error("Failed to fetch today's sequence");
        }
        const data = await response.json();
        console.log("Fetched sequence:", data); // Debugging line
        setSequence(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaySequence();
  }, []);

  if (loading) {
    return <p className="text-center text-epic-text">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Handle undefined or invalid sequence data
  if (!sequence || !sequence.projects || !Array.isArray(sequence.projects)) {
    return (
      <p className="text-center text-epic-text">No sequence found for today.</p>
    );
  }

  return (
    <div className="p-6 bg-epic-darker rounded-lg text-epic-text">
      <h2 className="text-2xl font-bold text-white mb-4">Today's Sequence</h2>
      <div className="flex items-center justify-center space-x-2">
        {sequence.projects.map((project, index) => (
          <div key={index} className="flex items-center">
            {/* Project Box */}
            <div className="relative p-4 bg-epic-dark rounded-lg shadow-md w-44 h-32 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-epic-primary">
                {project.projectName}
              </h3>
              <p className="text-sm text-epic-text">3 hours</p>
              {sequence.completed[index] && (
                <div className="absolute top-2 right-2 text-green-500">✔️</div>
              )}
            </div>

            {/* Arrow (except for the last project) */}
            {index < sequence.projects.length - 1 && (
              <div className="text-epic-text text-2xl">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaySequence;
