import React, { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

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

  // Define columns for the table
  const columns = useMemo(() => {
    const dateColumns = dates.map((day) => ({
      header: day,
      accessorKey: day.toString(),
      cell: ({ getValue, row }) => {
        const taskText = row.original.task;
        const isFullyCompleted = isTaskFullyCompleted(taskText);
        const isDayFullyCompleted = areAllTasksCompleted(day);

        return (
          <div
            className={`flex items-center justify-center w-full h-full py-2 rounded-lg ${
              fullyCompletedDays.includes(day)
                ? "bg-epic-highlight/50 text-white" // Full day completion highlight
                : isDayFullyCompleted
                  ? "bg-epic-success text-epic-dark font-bold"
                  : isFullyCompleted
                    ? "bg-epic-purple text-white"
                    : "bg-epic-darker"
            }`}
          >
            {getValue()}
          </div>
        );
      },
    }));

    return [
      {
        header: "Uzdevums",
        accessorKey: "task",
        cell: ({ getValue }) => (
          <span className="font-semibold text-epic-primary">{getValue()}</span>
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
                    className={`px-3 py-2 text-center text-sm font-bold uppercase border-r border-epic-border last:border-none ${
                      fullyCompletedDays.includes(Number(header.column.id))
                        ? "bg-epic-highlight text-white" // Highlight full day column header
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
                className="border-b border-epic-border hover:bg-epic-highlight/20 transition"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-3 py-2 text-center border-r border-epic-border last:border-none ${
                      fullyCompletedDays.includes(Number(cell.column.id))
                        ? "bg-epic-highlight/50 text-white" // Apply column-wide highlight
                        : ""
                    }`}
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
