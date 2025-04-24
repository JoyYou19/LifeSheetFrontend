import { useEffect, useState } from "react";

// Helper function to format time in HH:MM format
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to format duration
const formatDuration = (durationInSeconds) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  return `${hours}h ${minutes}min`;
};

function SleepInfo() {
  const [sleepData, setSleepData] = useState(null);

  // Fetch metrics from the API
  const fetchSleep = async () => {
    try {
      const response = await fetch("/get-sleep"); // Replace with your actual endpoint
      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        const processedData = processSleep(data);
        setSleepData(processedData);
      } else {
        console.error("Received data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  // Process sleep data
  const processSleep = (data) => {
    const today = new Date().toISOString().split("T")[0];
    console.log("Today's date (frontend):", today);

    // Log all sleep entries for debugging
    console.log("All sleep entries:", data);

    const todaySleep = data.find((entry) => {
      console.log("Checking entry:", entry.end_time);
      return entry.end_time.startsWith(today);
    });

    if (!todaySleep) {
      console.error("No sleep data found for today.");
      return null;
    }

    // Format start and end times and duration
    return {
      sleepStartTime: formatTime(todaySleep.start_time),
      wakeUpTime: formatTime(todaySleep.end_time),
      sleepDuration: formatDuration(parseInt(todaySleep.duration, 10)),
    };
  };

  useEffect(() => {
    fetchSleep();
  }, []);

  return (
    <div className="flex items-center">
      {sleepData ? (
        <SleepWidget
          sleepStartTime={sleepData.sleepStartTime}
          wakeUpTime={sleepData.wakeUpTime}
          sleepDuration={sleepData.sleepDuration}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default SleepInfo;

const SleepWidget = ({ sleepStartTime, wakeUpTime, sleepDuration }) => {
  return (
    <div className="text-white rounded-lg p-6 w-full max-w-sm mx-auto text-center">
      {/* Greeting Message */}
      <h2 className="text-2xl font-bold mb-4">Labrīt!</h2>

      {/* Sleep Details */}
      <div className="space-y-4">
        {/* Sleep Start Time */}
        <div className="flex items-center justify-center">
          <i className="fas fa-bed text-blue-400 mr-3"></i>
          <p>
            <span className="font-semibold">Aizgāji gulēt:</span>{" "}
            {sleepStartTime}
          </p>
        </div>

        {/* Wake Up Time */}
        <div className="flex items-center justify-center">
          <i className="fas fa-sun text-yellow-400 mr-3"></i>
          <p>
            <span className="font-semibold">Pamodies:</span> {wakeUpTime}
          </p>
        </div>

        {/* Total Sleep Duration */}
        <div className="flex items-center justify-center">
          <i className="fas fa-clock text-green-400 mr-3"></i>
          <p>
            <span className="font-semibold">Gulēji:</span> {sleepDuration}
          </p>
        </div>
      </div>
    </div>
  );
};
