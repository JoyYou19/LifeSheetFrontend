import React, { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FaCheck,
  FaStar,
  FaFire,
  FaCalendarCheck,
  FaRegCalendarCheck,
  FaTrophy,
} from "react-icons/fa";

const TaskCompletionTable = () => {
  const [completionData, setCompletionData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Fetch task completion data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/monthly-completions");
        const data = await response.json();
        setCompletionData(data);

        //const mockData = generateMockData();
        //setCompletionData(mockData);
      } catch (error) {
        console.error("Error fetching completion data:", error);
      }
    };

    fetchData();
  }, [currentMonth, currentYear]);

  // Extract unique tasks and dates
  const uniqueTasks = [...new Set(completionData.map((item) => item.taskText))];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a task was completed on a specific date
  const isTaskCompleted = (taskText, day) => {
    return completionData.some(
      (item) =>
        item.taskText === taskText &&
        new Date(item.completedAt).getDate() === day &&
        new Date(item.completedAt).getMonth() === currentMonth,
    );
  };

  // Check if all tasks were completed on a specific date
  const areAllTasksCompleted = (day) => {
    return uniqueTasks.every((task) => isTaskCompleted(task, day));
  };

  // Find fully completed days
  const fullyCompletedDays = useMemo(() => {
    return dates.filter((day) => areAllTasksCompleted(day));
  }, [dates, uniqueTasks, completionData]);

  // Check if a task was completed every day in the month
  const isTaskFullyCompleted = (taskText) => {
    return dates.every((day) => isTaskCompleted(taskText, day));
  };

  // Prepare data for the table
  const data = useMemo(() => {
    return uniqueTasks.map((task) => {
      const row = { task };
      dates.forEach((day) => {
        row[day] = isTaskCompleted(task, day) ? "✔️" : "";
      });
      return row;
    });
  }, [uniqueTasks, dates, completionData]);

  const weekdayNames = ["S", "M", "T", "W", "Th", "F", "S"];

  // Define columns for the table
  const columns = useMemo(() => {
    const dateColumns = dates.map((day) => {
      const date = new Date(currentYear, currentMonth, day);
      const weekdayIndex = date.getDay();
      const isWeekend = weekdayIndex === 0 || weekdayIndex === 6;

      return {
        header: () => (
          <div className="flex flex-col items-center">
            <div
              className={`text-xs font-medium ${
                isWeekend ? "text-blue-400" : "text-gray-400"
              }`}
            >
              {weekdayNames[weekdayIndex]}
            </div>
            <div
              className={`text-sm ${
                fullyCompletedDays.includes(day)
                  ? "font-bold text-yellow-300"
                  : "text-epic-text"
              }`}
            >
              {day}
            </div>
          </div>
        ),
        accessorKey: day.toString(),
        cell: ({ getValue, row }) => {
          const taskText = row.original.task;
          const isFullyCompleted = isTaskFullyCompleted(taskText);
          const isDayFullyCompleted = areAllTasksCompleted(day);
          const isCompleted = getValue() === "✔️";
          const isWeekend = [0, 6].includes(
            new Date(currentYear, currentMonth, day).getDay(),
          );

          return (
            <div className="w-full h-full">
              <div
                className={`flex items-center justify-center w-full h-full min-h-[48px] ${
                  isDayFullyCompleted
                    ? "bg-green-700 text-white" // Perfect day
                    : isFullyCompleted
                      ? "bg-purple-700 text-white" // Month streak
                      : isCompleted
                        ? isWeekend
                          ? "bg-blue-600 text-white" // Weekend completion
                          : "bg-blue-500 text-white" // Weekday completion
                        : "bg-gray-800"
                } ${isDayFullyCompleted ? " " : ""}`}
              >
                {isCompleted && (
                  <span className="flex items-center justify-center">
                    {isDayFullyCompleted ? (
                      <FaTrophy className="text-yellow-300 text-lg" />
                    ) : isFullyCompleted ? (
                      <FaFire className="text-orange-300 text-md animate-pulse" />
                    ) : isWeekend ? (
                      <FaCalendarCheck className="text-blue-200 text-md" />
                    ) : (
                      <FaCheck className="text-white text-sm" />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        },
      };
    });

    return [
      {
        header: "Uzdevums",
        accessorKey: "task",
        cell: ({ getValue }) => (
          <span className="font-semibold text-epic-primary px-3 py-2">
            {getValue()}
          </span>
        ),
      },
      ...dateColumns,
    ];
  }, [dates, uniqueTasks, completionData, fullyCompletedDays]);

  // Use React Table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-epic-darker rounded-2xl shadow-lg text-epic-text">
      <h2 className="text-xl font-semibold text-epic-primary mb-4 text-center">
        Uzdevumu izpildes tabula -{" "}
        {new Date(currentYear, currentMonth).toLocaleString("default", {
          month: "long",
        })}
      </h2>

      <div className="overflow-auto rounded-xl border border-epic-border">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-epic-dark text-epic-text border-b border-epic-border"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-1 py-1 text-center border-r border-epic-border last:border-none ${
                      fullyCompletedDays.includes(Number(header.column.id))
                        ? "bg-epic-highlight"
                        : ""
                    }`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-epic-highlight/20 transition"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={` last:border-none ${
                      fullyCompletedDays.includes(Number(cell.column.id))
                        ? "bg-epic-highlight/50" // Column-wide highlight
                        : ""
                    }`}
                    style={{ padding: "1px" }} // Remove padding from td
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskCompletionTable;

const generateMockData = () => {
  const tasks = [
    "Morning Routine",
    "Workout",
    "Read 30 mins",
    "Meditate",
    "Journal",
    "Work Project",
    "Evening Routine",
  ];

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const mockData = [];

  // Generate data for each task
  tasks.forEach((task) => {
    // Randomly decide if this task will be "fully completed" (all days)
    const isFullyCompleted = Math.random() > 0.7; // 30% chance

    for (let day = 1; day <= daysInMonth; day++) {
      // If fully completed, mark all days
      // Otherwise mark randomly (about 50% chance)
      const shouldComplete = isFullyCompleted ? true : Math.random() > 0.5;

      if (shouldComplete) {
        // Create a completion date (random time during the day)
        const completedAt = new Date(
          currentYear,
          currentMonth,
          day,
          Math.floor(Math.random() * 24), // hour
          Math.floor(Math.random() * 60), // minute
        ).toISOString();

        mockData.push({
          taskText: task,
          completedAt,
        });
      }
    }
  });

  // Ensure at least 3 fully completed days (where all tasks were done)
  const fullyCompletedDays = [];
  while (fullyCompletedDays.length < 3) {
    const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
    if (!fullyCompletedDays.includes(randomDay)) {
      fullyCompletedDays.push(randomDay);

      // Add all tasks for this day
      tasks.forEach((task) => {
        mockData.push({
          taskText: task,
          completedAt: new Date(
            currentYear,
            currentMonth,
            randomDay,
            12, // noon
            0,
          ).toISOString(),
        });
      });
    }
  }

  return mockData;
};
