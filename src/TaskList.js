import React, { useState, useEffect } from "react";

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Fetch tasks from the Go server on component load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/tasks");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Add new task
  const addTask = async () => {
    if (newTask.trim() !== "") {
      try {
        const response = await fetch("/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newTask, completed: false }),
        });

        const addedTask = await response.json();
        setTasks([...tasks, addedTask]);
        setNewTask("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id, completed) => {
    try {
      const response = await fetch(`/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        setTasks(
          tasks.map((task) =>
            task.id === id ? { ...task, completed: !completed } : task,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`/tasks/${id}`, { method: "DELETE" });

      if (response.ok) {
        setTasks(tasks.filter((task) => task.id !== id));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="bg-epic-darker rounded-2xl p-4 text-epic-text">
      <h2 className="text-lg font-semibold text-epic-text mb-3 text-center">
        Dienas uzdevumi
      </h2>

      <ul className="space-y-3">
        {Array.isArray(tasks) &&
          tasks.map((task) => (
            <div key={task.id} className="relative group">
              {/* Glowing Outline */}
              <div className="absolute -inset-[6px] rounded-2xl border-[3px] border-epic-primary opacity-0 scale-100 group-hover:opacity-100 transition-all duration-300"></div>

              {/* Hover Glow */}
              <div className="absolute -inset-[8px] rounded-2xl bg-epic-primary opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>

              {/* Task Item */}
              <li
                onClick={() => toggleTaskCompletion(task.id, task.completed)}
                className={`relative flex items-center p-3 rounded-xl cursor-pointer transition-colors w-full ${
                  task.completed
                    ? "bg-epic-primary text-epic-dark"
                    : "bg-epic-highlight text-epic-text hover:bg-epic-highlight/80"
                }`}
              >
                <div
                  className={`w-5 h-5 flex items-center justify-center rounded-md border ${
                    task.completed
                      ? "bg-epic-dark border-epic-dark"
                      : "border-epic-primary"
                  }`}
                >
                  {task.completed && (
                    <i className="fas fa-check text-epic-primary text-xs"></i>
                  )}
                </div>
                <span
                  className={`ml-3 flex-grow text-sm text-left ${
                    task.completed ? "line-through text-epic-text/50" : ""
                  }`}
                >
                  {task.text}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="absolute right-4 text-xs bg-rose-500 text-white px-2 py-1 rounded-lg hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Dzēst
                </button>
              </li>
            </div>
          ))}
      </ul>

      {/* Input and Add Button */}
      <div className="flex pt-4 justify-center items-center space-x-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Jauns uzdevums..."
          className="flex-grow bg-epic-darker border border-epic-border text-epic-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-epic-primary"
        />
        <button
          onClick={addTask}
          className="bg-epic-primary w-10 h-10 flex items-center justify-center text-epic-dark rounded-lg hover:bg-epic-primary-dark transition-all"
        >
          <i className="fas fa-plus text-sm"></i>
        </button>
      </div>
    </div>
  );
}

export default TaskList;
