import React, { useState, useEffect } from "react";

const SequenceTimer = ({ sequence }) => {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
  const [isRunning, setIsRunning] = useState(false);

  // Find the first incomplete block when the sequence updates
  useEffect(() => {
    if (sequence && sequence.completed) {
      const firstIncompleteBlock = sequence.completed.findIndex(
        (completed) => !completed,
      );
      if (firstIncompleteBlock !== -1) {
        setCurrentBlock(firstIncompleteBlock);
      } else {
        // All blocks are completed
        setCurrentBlock(sequence.projects.length);
      }
    }
  }, [sequence]);

  // Start the timer for the current block
  const startTimer = async () => {
    if (currentBlock >= sequence.projects.length) return;

    // Mark the block as started in the backend
    try {
      const response = await fetch("/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sequenceId: sequence.id,
          blockIndex: currentBlock,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to start session");
      }
      setIsRunning(true);
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  // Complete the current block
  const completeBlock = async () => {
    try {
      const response = await fetch("/complete-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sequenceId: sequence.id,
          blockIndex: currentBlock,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to complete block");
      }
      setIsRunning(false);

      // Find the next incomplete block
      const nextIncompleteBlock = sequence.completed.findIndex(
        (completed, index) => !completed && index > currentBlock,
      );

      if (nextIncompleteBlock !== -1) {
        setCurrentBlock(nextIncompleteBlock);
      } else {
        // All blocks are completed
        setCurrentBlock(sequence.projects.length);
      }

      setTimeLeft(3 * 60 * 60); // Reset timer for the next block
    } catch (error) {
      console.error("Error completing block:", error);
    }
  };

  // Timer logic
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          completeBlock();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  // Format time (HH:MM:SS)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="p-4 bg-epic-dark rounded-lg">
      <h3 className="text-lg font-semibold text-epic-primary mb-4">
        Sodienas saraksts
      </h3>
      <div className="space-y-4">
        {sequence.projects.map((project, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              index === currentBlock
                ? "bg-epic-darker border-2 border-epic-primary"
                : "bg-epic-darker"
            }`}
          >
            <h4 className="text-md font-semibold text-epic-text">
              {project.projectName}
            </h4>
            {index === currentBlock && (
              <div className="mt-2">
                <p className="text-sm text-epic-text">
                  Atlikusais laiks: {formatTime(timeLeft)}
                </p>
                {!isRunning && (
                  <div className="relative group">
                    {/* Glowing Outline */}
                    <div className="absolute mt-2 ml-9 mr-9 -inset-[6px] rounded-xl border-[3px] border-epic-primary px-4 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>

                    {/* Hover Glow */}
                    <div className="absolute mt-2 ml-6 mr-6  -inset-[8px] rounded-2xl bg-epic-primary opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>

                    <button
                      onClick={startTimer}
                      className="mt-2 bg-epic-primary text-epic-dark px-4 py-2 rounded-lg hover:bg-epic-primary-dark transition-all"
                    >
                      Sakt
                    </button>
                  </div>
                )}
              </div>
            )}
            {sequence.completed[index] && (
              <div className="mt-2 text-green-500">✔️ Pabeigts</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SequenceTimer;
