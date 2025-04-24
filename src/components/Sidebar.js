import { useEffect, useState } from "react";
import { FiBarChart2, FiClock } from "react-icons/fi";
import { GoHomeFill } from "react-icons/go";
import { RiDatabase2Fill } from "react-icons/ri";
import SequenceTimer from "./SequenceTimer";
import TimeTracker from "./TimeTracker";

const Sidebar = ({ currentPage, onPageChange }) => {
  const [sequence, setSequence] = useState(null);

  // Fetch today's sequence
  useEffect(() => {
    const fetchTodaySequence = async () => {
      try {
        const response = await fetch("/today-sequence");
        if (!response.ok) {
          throw new Error("Failed to fetch today's sequence");
        }
        const data = await response.json();
        setSequence(data);
      } catch (error) {
        console.error("Error fetching sequence:", error);
      }
    };

    fetchTodaySequence();
  }, []);

  if (!sequence) {
    return <p className="text-center text-epic-text">Loading...</p>;
  }
  return (
    <div className="w-64 bg-epic-darker p-6 border-r border-epic-border">
      <div className="flex flex-col space-y-4">
        {/* Navigation Items */}
        {[
          { id: "home", label: "Sākums", icon: <GoHomeFill /> },
          { id: "charts", label: "Grafiki", icon: <FiBarChart2 /> },
          { id: "data", label: "Dati", icon: <RiDatabase2Fill /> },
          { id: "projects", label: "Projekti", icon: <RiDatabase2Fill /> },
        ].map(({ id, label, icon }) => (
          <div key={id} className="relative group">
            {/* Glowing Outline */}
            <div className="absolute -inset-[6px] rounded-xl border-[3px] border-epic-primary opacity-0 scale-100 group-hover:opacity-100 transition-all duration-300"></div>

            {/* Hover Glow */}
            <div className="absolute -inset-[8px] rounded-2xl bg-epic-primary opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>

            {/* Button */}
            <button
              onClick={() => onPageChange(id)}
              className={`relative flex items-center p-3 w-full rounded-lg transition-colors ${
                currentPage === id
                  ? "bg-epic-primary hover:bg-epic-primary-dark text-epic-dark"
                  : "text-epic-text hover:bg-epic-highlight"
              }`}
            >
              <span
                className={`text-xl mr-3 ${
                  currentPage === id ? "text-epic-dark" : "text-epic-primary"
                }`}
              >
                {icon}
              </span>
              {label}
            </button>
          </div>
        ))}

        {/* Separator */}
        <div className="border-t border-epic-border my-4"></div>

        <div className="flex items-center text-epic-text">
          <SequenceTimer sequence={sequence} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
