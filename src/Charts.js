import { useEffect, useRef, useState } from "react";

function Charts() {
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
        console.log(data);
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

  // Process metrics data to calculate language usage percentage
  const processMetrics = (data) => {
    // Filter data to include only today's metrics
    const today = new Date().toISOString().split("T")[0];
    const todayData = data.filter((entry) => entry.date === today);

    if (todayData.length === 0) {
      console.error("No data found for today's date");
      return { subvalues: [] }; // Return empty data for chart
    }

    // Define colors for each language
    const languageColors = {
      lua: "#3498db", // Lua (Blue)
      javascript: "#f1c40f", // JavaScript (Yellow)
      python: "#e74c3c", // Python (Red)
      typescript: "#9b59b6", // TypeScript (Purple)
      rust: "#dea584", // Rust (Brownish Orange)
      go: "#00add8", // Go (Teal)
      html: "#e34c26", // HTML (Orange-Red)
      css: "#264de4", // CSS (Blue)
      // Add more languages here
    };

    // Aggregate total lines added for each language
    const languageTotals = {};
    todayData.forEach((entry) => {
      for (const [language, langData] of Object.entries(entry.languages)) {
        if (!languageTotals[language]) {
          languageTotals[language] = 0;
        }
        languageTotals[language] += langData.total_lines_added || 0;
      }
    });

    // Calculate the grand total of lines added across all languages
    const totalLinesAdded = Object.values(languageTotals).reduce(
      (sum, lines) => sum + lines,
      0,
    );

    if (totalLinesAdded === 0) {
      console.error(
        "Total lines added for today is zero; nothing to display on chart.",
      );
      return { subvalues: [] };
    }

    // Build the subvalues array for the pie chart
    const subvalues = Object.entries(languageTotals).map(
      ([language, linesAdded]) => {
        const percentage = (linesAdded / totalLinesAdded) * 100;
        return {
          name: language.charAt(0).toUpperCase() + language.slice(1), // Capitalize language name
          value: percentage,
          style: { fillColor: languageColors[language] || "gray" }, // Use default color if language not in map
        };
      },
    );

    return {
      subvalues,
    };
  };

  const initializeChart = (chartData) => {
    if (window.PieChart && chartContainerRef.current) {
      chartInstance.current = new window.PieChart({
        container: chartContainerRef.current,
        data: { preloaded: chartData },
        title: {
          text: "Valodu statistika",
          align: "left",
        },
        area: {
          style: {
            fillColor: "#0a0a0a",
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
        chartContainerRef.current.classList.remove("pointer-events-none");
      }, 500); // Adjust the delay time as needed

      // Attach the resize event listener
      //window.addEventListener("resize", handleResize);

      // Cleanup listener on component unmount
      return () => {
        //window.removeEventListener("resize", handleResize);
      };
    } else {
      console.error("NetChart is not available on window.");
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
    <div className="rounded">
      <div
        id="demo"
        ref={chartContainerRef}
        className="pointer-events-none w-full rounded h-full bg-white m-0 p-0 overflow-hidden"
      />
    </div>
  );
}

export default Charts;
