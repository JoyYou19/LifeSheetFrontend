import { useEffect, useRef, useState } from "react";

// Helper function to format the date
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("lv-LV", options);
};

// Helper function to format the date
const formatTime = (dateString) => {
  const options = {
    hour: "numeric",
    minute: "numeric",
  };
  return new Date(dateString).toLocaleDateString("lv-LV", options);
};

// Helper function to convert duration string to seconds
const durationToSeconds = (duration) => {
  const regex = /(\d+)h|(\d+)m|(\d+)(\.\d+)s/g;
  let totalSeconds = 0;
  let match;

  while ((match = regex.exec(duration)) !== null) {
    if (match[1]) totalSeconds += parseInt(match[1], 10) * 3600; // hours
    if (match[2]) totalSeconds += parseInt(match[2], 10) * 60; // minutes
    if (match[3]) totalSeconds += parseFloat(match[3]); // seconds
  }

  return totalSeconds;
};

// Helper function to format duration in a human-readable format
const formatDuration = (duration) => {
  const ms = duration.match(/(\d+)\.\d+s/);
  const totalSeconds = durationToSeconds(duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} min ${seconds} sec`;
};

// Process sessions data into required format
const processSessions = (data) => {
  const dailyTotals = {};

  data.forEach((session) => {
    const date = formatDate(session.start_time); // Format the start_time for the date
    const durationInSeconds = durationToSeconds(session.duration); // Convert duration to seconds

    // Initialize daily totals if the date doesn't exist
    if (!dailyTotals[date]) {
      dailyTotals[date] = {
        totalSeconds: 0, // Total time for the day
        subvalues: [], // Subvalues for individual sessions
      };
    }

    // Accumulate total time spent for the day
    dailyTotals[date].totalSeconds += durationInSeconds;

    // Add session time to subvalues
    dailyTotals[date].subvalues.push({
      name: `${formatTime(session.start_time)} (${formatDuration(session.duration)})`, // Include formatted duration in the name
      value: durationInSeconds, // Set value as duration for this session
    });
  });

  // Convert the daily totals object into the format required by FacetChart
  const processedData = Object.entries(dailyTotals).map(
    ([date, { totalSeconds, subvalues }]) => ({
      subvalues: subvalues, // Include individual session times as subvalues
      name: date, // Set the date as the name
      value: totalSeconds, // Total time spent in seconds for that day
      id: date, // Use date as an identifier
    }),
  );

  return {
    subvalues: processedData, // Place the processed data in the subvalues field
  };
};

// SessionFacetChart Component
const SessionFacetChart = () => {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(false);

  // Fetch sessions from the API
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/sessions"); // Replace with your actual endpoint
      const data = await response.json();

      console.log("RECEIVED SESSION DATA: ", data);

      // Ensure data is an array
      if (Array.isArray(data)) {
        const processedData = processSessions(data);
        initializeChart(processedData); // Pass the processed data to initialize the chart
      } else {
        console.error("Received data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize chart with processed data
  const initializeChart = (data) => {
    if (window.FacetChart && chartContainerRef.current) {
      chartInstance.current = new window.FacetChart({
        container: chartContainerRef.current,
        data: {
          preloaded: data, // Use the processed data here
        },
        series: [{ data: { field: "value" } }],
        area: {
          height: 320.0,
          style: {
            fillColor: "rgba(0,0,0,1)",
          },
        },
        interaction: {
          resizing: {
            enabled: false,
          },
        },
      });

      // Delay the removal of the class to ensure the chart is fully initialized
      setTimeout(() => {
        if (chartContainerRef.current) {
          chartContainerRef.current.classList.remove("pointer-events-none");
        }
      }, 1000);
    } else {
      console.error("FacetChart is not available on window.");
    }
  };

  useEffect(() => {
    fetchSessions(); // Fetch sessions on component mount
  }, []);

  return (
    <div className="rounded w-1/2 h-1/2">
      {loading && <p>Loading...</p>}
      <div
        id="sessionchart"
        ref={chartContainerRef}
        className="pointer-events-none w-full rounded h-full bg-white m-0 p-0 overflow-hidden"
      />
    </div>
  );
};

export default SessionFacetChart;
