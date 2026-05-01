import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchProjects = async () => {
    const { data } = await api.get("/api/projects");
    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();

    await api.post("/api/projects", {
      name,
      description
    });

    setName("");
    setDescription("");
    fetchProjects();
  };

  return (
    <div className="container">
      <h2>Projects</h2>

      {/* CREATE PROJECT */}
      <div className="card">
        <h3>Create Project</h3>

        <form onSubmit={createProject} className="form">
          <input
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit">Create</button>
        </form>
      </div>

      {/* PROJECT LIST */}
      <div className="card">
        <h3>All Projects</h3>

        {projects.map((project) => (
          <div key={project._id} style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px"
          }}>
            <h4>{project.name}</h4>
            <p>{project.description}</p>

            <p><b>Members:</b> {project.members?.length}</p>

            <Link to={`/projects/${project._id}`}>
              <button>Open Project</button>
            </Link>

            <Link to={`/projects/${project._id}/dashboard`}>
              <button style={{ marginLeft: "10px" }}>
                View Dashboard
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;