import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/api/projects");
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/api/projects", {
        name,
        description
      });

      setName("");
      setDescription("");
      setMessage("Project created successfully");

      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className="container">
      <h2>My Projects</h2>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Create Project</h3>

        <form className="form" onSubmit={createProject}>
          <input
            type="text"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit">Create Project</button>
        </form>
      </div>

      <div className="card">
        <h3>Projects List</h3>

        {projects.length === 0 && <p>No projects found.</p>}

        {projects.map((project) => (
          <div key={project._id} className="task-card">
            <h4>{project.name}</h4>
            <p>{project.description}</p>

            <Link to={`/projects/${project._id}`}>
              <button>Open Project</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;