// MetricFacetChart.js
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

const MetricFacetChart = () => {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(false);

  // Fetch metrics from the API
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/get-metrics"); // Replace with your actual endpoint
      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        const processedData = processMetrics(data);
        initializeChart(processedData); // Pass the processed data to initialize the chart
      } else {
        console.error("Received data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process metrics data into required format
  const processMetrics = (data) => {
    const dailyTotals = {};

    data.forEach((metric) => {
      const date = formatDate(metric.date); // Use the provided date directly
      const durationInSeconds = metric.total_time_spent; // Use total_time_spent from your data
      const metricName = `Metric + ${metric.total_time_spent}`; // Example of a derived metric name

      // Convert seconds to hours and minutes
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const formattedDuration = `${hours}h ${minutes}m`; // Format to "Xh Ym"

      // Initialize daily totals if the date doesn't exist
      if (!dailyTotals[date]) {
        dailyTotals[date] = {
          totalSeconds: 0, // Total time for the day
          subvalues: [], // Subvalues for individual metrics
        };
      }

      // Accumulate total time spent for the day in seconds
      dailyTotals[date].totalSeconds += durationInSeconds;

      // Check if this metric already exists in subvalues
      const existingMetric = dailyTotals[date].subvalues.find(
        (sub) => sub.name === metricName,
      );

      if (existingMetric) {
        existingMetric.value += durationInSeconds; // Add to existing metric in seconds
      } else {
        // Add new metric to subvalues
        dailyTotals[date].subvalues.push({
          name: `${formatTime(metric.date)} (${formattedDuration})`, // Include formatted duration in the name
          value: durationInSeconds, // Store original duration in seconds for consistency
        });
      }
    });

    // Convert the daily totals object into the format required by FacetChart
    const processedData = Object.entries(dailyTotals).map(
      ([date, { totalSeconds, subvalues }]) => {
        // Convert total daily time from seconds to "hours and minutes" for display
        const totalHours = Math.floor(totalSeconds / 3600);
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
        const formattedTotal = `${totalHours}h ${totalMinutes}m`;
        const totalHoursDecimal = totalSeconds / 3600;

        return {
          subvalues: subvalues, // Include individual metrics as subvalues
          name: date, // Set the date as the name
          value: totalHoursDecimal, // Total time in hours and minutes for that day
          id: date, // Use date as an identifier
        };
      },
    );

    return {
      subvalues: processedData, // Place the processed data in the subvalues field
    };
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
          height: 320,
          style: {
            fillColor: "rgba(0,0,0,1)",
          },
        },
        interaction: {
          resizing: {
            enabled: false,
          },
        },
        style: {
          columnColors: ["rgba(74, 227, 126,1)"],
          lineColors: ["rgba(74, 227, 126,0)"],
        },
      });

      // Delay the removal of the class to ensure the chart is fully initialized
      setTimeout(() => {
        if (chartContainerRef.current) {
          // Check if the reference is not null
          chartContainerRef.current.classList.remove("pointer-events-none");
        }
      }, 1000);
    } else {
      console.error("FacetChart is not available on window.");
    }
  };

  // Cleanup function to unmount the chart
  const cleanupChart = () => {
    if (chartInstance.current) {
      // Perform cleanup if needed, like destroying chart instance (if the library allows)
      // e.g., chartInstance.current.destroy();
      chartInstance.current = null; // Reset the chart instance
    }
  };

  useEffect(() => {
    fetchMetrics(); // Fetch metrics on component mount

    return () => {
      cleanupChart(); // Cleanup when the component unmounts
    };
  }, []);

  return (
    <div className="rounded w-full h-full">
      <p>NeoVim Metrics</p>

      {loading && <p>Loading...</p>}
      <div
        id="timechart"
        ref={chartContainerRef}
        className="pointer-events-none w-full rounded h-full bg-black m-0 p-0 overflow-hidden"
      />
    </div>
  );
};

export default MetricFacetChart;
