import React, { useEffect, useState } from "react";

function MetricsViewer() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch metrics from the API
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/get-metrics"); // Replace with your actual endpoint
      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setMetrics(data); // If data is valid, update state
      } else {
        console.error("Received data is not an array:", data);
        setMetrics([]); // Set empty array if not an array
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert seconds into a readable format
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs > 0 ? `${hrs}h ` : ""}${mins}m ${secs}s`;
  };

  // Fetch the metrics on component mount
  useEffect(() => {
    fetchMetrics();
  }, []);

return (
    <div className="p-4 bg-neutral-900 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Coding Metrics</h2>
        <button
          onClick={fetchMetrics}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {metrics.length === 0 ? (
        <p className="text-white">No metrics to display.</p>
      ) : (
        <ul className="space-y-4">
          {metrics.map((metric, index) => (
            <li key={index} className="bg-black p-4 rounded-lg shadow-md">
              <div className="grid grid-cols-2 gap-4">
                {/* Time Spent */}
                <div className="flex items-center">
                  <i className="fas fa-clock text-blue-500 mr-2"></i>
                  <span className="text-white font-semibold">
                    {formatTime(metric.total_time_spent)}
                  </span>
                </div>

                {/* Lines Added */}
                <div className="flex items-center">
                  <i className="fas fa-plus text-green-500 mr-2"></i>
                  <span className="text-white font-semibold">
                    {metric.total_lines_added} Lines Added
                  </span>
                </div>

                {/* Lines Deleted */}
                <div className="flex items-center">
                  <i className="fas fa-minus text-red-500 mr-2"></i>
                  <span className="text-white font-semibold">
                    {metric.total_lines_deleted} Lines Deleted
                  </span>
                </div>

                {/* Start Time */}
                <div className="flex items-center">
                  <i className="fas fa-play text-gray-500 mr-2"></i>
                  <span className="text-white font-semibold">
                    Start:{" "}
                    {new Date(metric.start_time * 1000).toLocaleTimeString()}
                  </span>
                </div>

                {/* End Time */}
                <div className="flex items-center">
                  <i className="fas fa-stop text-gray-500 mr-2"></i>
                  <span className="text-white font-semibold">
                    End: {new Date(metric.end_time * 1000).toLocaleTimeString()}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center col-span-2">
                  <i className="fas fa-calendar text-yellow-500 mr-2"></i>
                  <span className="text-white font-semibold">
                    Date: {metric.date}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MetricsViewer;
