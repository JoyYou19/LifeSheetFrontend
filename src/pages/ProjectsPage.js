import React, { useEffect, useState } from "react";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [priority, setPriority] = useState(0);

  // Fetch projects from the backend
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await fetch("/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []); // Ensure data is always an array
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]); // Set projects to an empty array in case of error
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const addProject = async () => {
    if (!newProject.name) return alert("Project name is required!");

    setLoading(true);
    try {
      const response = await fetch("/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) throw new Error("Failed to add project");

      const createdProject = await response.json();
      setProjects([...projects, createdProject]);
      setNewProject({ name: "", description: "", imageUrl: "" }); // Reset form
    } catch (error) {
      console.error("Error adding project:", error);
    }
    setLoading(false);
  };

  const deleteProject = async (id) => {
    // Confirm deletion with the user
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      // Send a DELETE request to the backend
      const response = await fetch(`/projects/delete?id=${id}`, {
        method: "DELETE",
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // Remove the deleted project from the local state
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== id),
      );

      // Optional: Show a success message
      alert("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setPriority(project.priority || 0); // Set the current priority if it exists
  };

  const handlePriorityChange = async (newPriority) => {
    setPriority(newPriority);

    try {
      const response = await fetch(`/projects/${selectedProject.id}/priority`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) throw new Error("Failed to update priority");

      // Update the project in the local state
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === selectedProject.id
            ? { ...project, priority: newPriority }
            : project,
        ),
      );
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  return (
    <div className="p-6 bg-epic-darker rounded-lg text-epic-text">
      <h2 className="text-2xl font-bold text-epic-primary mb-4">Projekti</h2>

      {/* Project List */}
      {loading ? (
        <p className="text-epic-text text-center">Loading...</p>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="relative flex flex-col items-center rounded-xl overflow-visible group"
              onClick={() => handleProjectClick(project)}
            >
              <div className="cursor-pointer w-full relative">
                <div className="relative">
                  {/* Glow (blurred version of the image) */}
                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="absolute inset-0 h-52 scale-x-110 scale-y-110 object-cover rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  )}

                  {/* Main Image */}
                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="relative w-full h-48 object-cover rounded-xl transition-transform duration-300"
                    />
                  )}

                  {/* Border */}
                  <div className="absolute -inset-[10px] rounded-3xl border-4 border-white opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
                </div>

                {/* Overlay with Project Details */}
                <div className="absolute inset-0 duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-lg font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.name}
                  </h3>
                  <p className="text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.description}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the click from bubbling up to the project div
                      deleteProject(project.id);
                    }}
                    className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                  >
                    Dzēst
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-epic-text col-span-full text-center">
          Nav pievienotu projektu.
        </p>
      )}

      {/* Add Project Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-epic-primary text-epic-dark p-4 rounded-full shadow-lg hover:bg-epic-primary-dark transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Project Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-epic-dark rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-epic-text mb-4">
              Pievienot projektu
            </h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                placeholder="Nosaukums"
                value={newProject.name}
                onChange={handleInputChange}
                className="p-2 rounded bg-epic-darker text-epic-text"
              />
              <textarea
                name="description"
                placeholder="Apraksts"
                value={newProject.description}
                onChange={handleInputChange}
                className="p-2 rounded bg-epic-darker text-epic-text"
              />
              <input
                type="text"
                name="imageUrl"
                placeholder="Attēla URL (neobligāti)"
                value={newProject.imageUrl}
                onChange={handleInputChange}
                className="p-2 rounded bg-epic-darker text-epic-text"
              />
              <div className="flex gap-2">
                <button
                  onClick={addProject}
                  className="bg-epic-primary text-epic-dark p-2 rounded-lg hover:bg-epic-primary-dark transition-all flex-1"
                  disabled={loading}
                >
                  {loading ? "Pievieno..." : "Pievienot projektu"}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-neutral-700 text-white p-2 rounded-lg hover:bg-red-500 transition-all flex-1"
                >
                  Atcelt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-epic-dark rounded-lg p-6 w-full max-w-2xl">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Project Image */}
              {selectedProject.imageUrl && (
                <div className="w-full md:w-1/2">
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.name}
                    className="w-full h-64 object-contain rounded-lg bg-epic-darker"
                    onError={(e) => {
                      e.target.src = "placeholder-image-url"; // Fallback if the image fails to load
                    }}
                  />
                </div>
              )}
              {/* Project Details */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-epic-primary">
                  {selectedProject.name}
                </h3>
                <p className="text-epic-text text-lg">
                  {selectedProject.description}
                </p>
                <div className="flex flex-col gap-2">
                  <label className="text-epic-text text-lg">Priority:</label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      handlePriorityChange(Number(e.target.value))
                    }
                    className="p-2 rounded bg-epic-darker text-epic-text text-lg"
                  >
                    {[0, 1, 2, 3].map((p) => (
                      <option key={p} value={p}>
                        Priority {p}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="mt-4 bg-neutral-700 text-white p-3 rounded-lg hover:bg-red-500 transition-all text-lg"
                >
                  Aizvērt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
