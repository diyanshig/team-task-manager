import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Projects = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: ""
  });

  const fetchProjects = async () => {
    const { data } = await api.get("/api/projects");
    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();

    await api.post("/api/projects", form);

    setForm({
      name: "",
      description: ""
    });

    fetchProjects();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="navbar">
        <strong>Team Task Manager</strong>
        <div>
          <span style={{ marginRight: 12 }}>{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Create Project</h2>

          <form className="form" onSubmit={createProject}>
            <input
              placeholder="Project name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <textarea
              placeholder="Project description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button type="submit">Create Project</button>
          </form>
        </div>

        <div className="card">
          <h2>My Projects</h2>

          {projects.length === 0 && <p>No projects found.</p>}

          {projects.map((project) => (
            <div className="project-card" key={project._id}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p>Members: {project.members.length}</p>

              <Link to={`/projects/${project._id}`}>
                <button>Open Project</button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Projects;