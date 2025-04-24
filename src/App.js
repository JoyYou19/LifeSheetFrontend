import "./App.css";
import TaskList from "./TaskList";
import Charts from "./Charts";
import MetricFacetChart from "./FacetChart";
import SessionList from "./SessionList";
import SessionFacetChart from "./SessionsFacetChart";
import SleepInfo from "./SleepInfo";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TaskCompletionTable from "./components/TaskCompletionTable";
import ProjectsPage from "./pages/ProjectsPage";
import ProductivityPercentage from "./components/ProductivityPercentage";
import TodaySequence from "./components/TodaySequence";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="App h-screen bg-epic-dark font-nunito flex">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow p-8 overflow-auto">
          {currentPage === "home" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Sleep Info and Charts */}
              <div className="col-span-2 space-y-6">
                <div className="bg-epic-darker rounded-xl p-6 border border-epic-border">
                  <SleepInfo />
                </div>

                <div className="bg-epic-darker rounded-xl p-6 border border-epic-border">
                  <ProductivityPercentage />
                </div>

                <div className="bg-epic-darker rounded-xl p-6 border border-epic-border">
                  <TodaySequence />
                </div>
              </div>

              {/* Right Column: Task List */}
              <div className="bg-epic-darker rounded-xl p-6 border border-epic-border">
                <TaskList />
              </div>
            </div>
          )}

          {currentPage === "charts" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-epic-darker rounded-xl p-6 border border-epic-border">
                  <MetricFacetChart />
                </div>
                <div className="bg-epic-darker rounded-xl p-6 border border-epic-border">
                  <SessionFacetChart />
                </div>
              </div>
              <div className="bg-epic-darker rounded-xl p-6 border border-epic-border">
                <SessionList />
              </div>
            </div>
          )}

          {currentPage === "data" && (
            <div className="bg-epic-darker rounded-xl p-6 border border-epic-border">
              {/* Add data components here */}
              <TaskCompletionTable />
            </div>
          )}

          {currentPage === "projects" && (
            <div className="bg-epic-darker rounded-xl p-6 border border-epic-border">
              {/* Add data components here */}
              <ProjectsPage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
