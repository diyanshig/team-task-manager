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
    try {
      const { data } = await api.get("/api/projects");
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/projects", form);

      setForm({
        name: "",
        description: ""
      });

      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    }
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
          <span style={{ marginRight: 12 }}>
            {user?.name}
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        {/* CREATE PROJECT */}
        <div className="card">
          <h2>Create Project</h2>

          <form className="form" onSubmit={createProject}>
            <input
              placeholder="Project name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />

            <textarea
              placeholder="Project description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
            />

            <button type="submit">
              Create Project
            </button>
          </form>
        </div>

        {/* MY PROJECTS */}
        <div className="card">
          <h2>My Projects</h2>

          {projects.length === 0 && (
            <p>No projects found.</p>
          )}

          {projects.map((project) => (
            <div
              className="project-card"
              key={project._id}
            >
              <h3>{project.name}</h3>

              <p>{project.description}</p>

              <p>
                Members: {project.members.length}
              </p>

              {/* Open Project */}
              <Link to={`/projects/${project._id}`}>
                <button>
                  Open Project
                </button>
              </Link>

              {/* Dashboard Button */}
              <Link
                to={`/dashboard/${project._id}`}
              >
                <button
                  style={{
                    marginLeft: "10px"
                  }}
                >
                  Dashboard
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Projects;