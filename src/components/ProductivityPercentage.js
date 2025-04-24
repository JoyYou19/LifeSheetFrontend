import React, { useEffect, useState } from "react";

const ProductivityPercentage = () => {
  const [productivityData, setProductivityData] = useState({
    total_productive_time: "0h0m0s",
    total_awake_time: "16h0m0s",
    productivity_percentage: 0,
    sleep_duration: "0h0m0s",
    base_productivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse duration string to hours
  const parseDuration = (duration) => {
    const matches = duration.match(/(\d+)h(\d+)m([\d.]+)s/); // note the [\d.]+
    if (!matches) {
      console.warn("Unrecognized duration format for the parse: ", duration);
      return 0;
    }
    return (
      parseFloat(matches[1]) +
      parseFloat(matches[2]) / 60 +
      parseFloat(matches[3]) / 3600
    );
  };

  // Fetch productivity data from the backend
  useEffect(() => {
    const fetchProductivityData = async () => {
      try {
        const response = await fetch("/productivity-percentage");
        if (!response.ok) {
          throw new Error("Failed to fetch productivity data.");
        }
        const data = await response.json();
        setProductivityData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductivityData();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const sleepHours = parseDuration(productivityData.sleep_duration);
  const sleepPenalty =
    productivityData.base_productivity -
    productivityData.productivity_percentage;
  const sleepQuality =
    sleepHours < 6
      ? "Poor"
      : sleepHours < 7
        ? "Fair"
        : sleepHours <= 9
          ? "Excellent"
          : "Excessive";

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-center text-white mb-4">
        Today's Productivity Breakdown
      </h2>

      {/* Main Productivity Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-white">
            Your Productivity
          </span>
          <span className="text-sm font-medium text-white">
            {productivityData.productivity_percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-4 bg-black rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
            style={{
              width: `${productivityData.productivity_percentage}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="flex gap-6 flex-wrap md:flex-nowrap">
        {/* Sleep Impact Visualization */}
        <div className="flex-1 min-w-[280px] bg-black p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            Sleep Impact
          </h3>

          <div className="flex items-center mb-2">
            <div className="w-24 text-sm text-gray-300">Duration:</div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-8 text-center">
                  <span className="text-white">{sleepHours.toFixed(1)}h</span>
                </div>
                <div className="flex-1 ml-2">
                  <div className="w-full bg-neutral-600 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        sleepQuality === "Excellent"
                          ? "bg-green-500"
                          : sleepQuality === "Fair"
                            ? "bg-yellow-500"
                            : sleepQuality === "Poor"
                              ? "bg-red-500"
                              : "bg-purple-500"
                      }`}
                      style={{
                        width: `${Math.min((sleepHours / 9) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center mb-2">
            <div className="w-24 text-sm text-gray-300">Quality:</div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                sleepQuality === "Excellent"
                  ? "bg-green-900 text-green-100"
                  : sleepQuality === "Fair"
                    ? "bg-yellow-900 text-yellow-100"
                    : sleepQuality === "Poor"
                      ? "bg-red-900 text-red-100"
                      : "bg-purple-900 text-purple-100"
              }`}
            >
              {sleepQuality}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-24 text-sm text-gray-300">Penalty:</div>
            <div className="text-red-400 font-medium">
              -{sleepPenalty.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Time Breakdown */}
        <div className="grid grid-cols-2 gap-4 text-sm flex-1 min-w-[280px]">
          <div className="bg-black p-3 rounded-lg">
            <div className="text-gray-400">Productive Time</div>
            <div className="text-white font-medium">
              {productivityData.total_productive_time}
            </div>
          </div>
          <div className="bg-black p-3 rounded-lg">
            <div className="text-gray-400">Awake Time</div>
            <div className="text-white font-medium">
              {productivityData.total_awake_time}
            </div>
          </div>
          <div className="bg-black p-3 rounded-lg">
            <div className="text-gray-400">Base Productivity</div>
            <div className="text-white font-medium">
              {productivityData.base_productivity.toFixed(1)}%
            </div>
          </div>
          <div className="bg-black p-3 rounded-lg">
            <div className="text-gray-400">Sleep Duration</div>
            <div className="text-white font-medium">
              {productivityData.sleep_duration}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityPercentage;
