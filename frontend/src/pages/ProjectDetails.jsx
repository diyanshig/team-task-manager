import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignedTo: ""
  });

  const fetchProject = async () => {
    const { data } = await api.get(`/api/projects/${projectId}`);
    setProject(data);
  };

  const fetchTasks = async () => {
    const { data } = await api.get(`/api/tasks/project/${projectId}`);
    setTasks(data);
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  if (!project) {
    return <div className="container">Loading...</div>;
  }

  const currentMember = project.members.find(
    (member) => member.user._id === user.id
  );

  const isAdmin = currentMember?.role === "Admin";

  const addMember = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post(`/api/projects/${projectId}/members`, {
        email: memberEmail,
        role: "Member"
      });

      setMemberEmail("");
      setMessage("Member added successfully");
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add member");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post(`/api/tasks/project/${projectId}`, taskForm);

      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        assignedTo: ""
      });

      setMessage("Task created successfully");
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create task");
    }
  };

  const updateStatus = async (taskId, status) => {
    setMessage("");
    setError("");

    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status");
    }
  };

  const deleteTask = async (taskId) => {
    setMessage("");
    setError("");

    try {
      await api.delete(`/api/tasks/${taskId}`);
      setMessage("Task deleted");
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete task");
    }
  };

  return (
    <div className="container">
      <p>
        <Link to="/projects">← Back to Projects</Link>
      </p>

      <div className="card">
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <p>
          Your role: <strong>{currentMember?.role}</strong>
        </p>

        <Link to={`/projects/${projectId}/dashboard`}>
          <button className="secondary">View Dashboard</button>
        </Link>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Members</h3>

        {project.members.map((member) => (
          <p key={member.user._id}>
            {member.user.name} - {member.user.email}{" "}
            <span className="badge">{member.role}</span>
          </p>
        ))}
      </div>

      {isAdmin && (
        <div className="card">
          <h3>Add Member</h3>

          <form className="form" onSubmit={addMember}>
            <input
              type="email"
              placeholder="Member email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />

            <button type="submit">Add Member</button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div className="card">
          <h3>Create Task</h3>

          <form className="form" onSubmit={createTask}>
            <input
              placeholder="Task title"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
            />

            <textarea
              placeholder="Task description"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
            />

            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) =>
                setTaskForm({ ...taskForm, dueDate: e.target.value })
              }
            />

            <select
              value={taskForm.priority}
              onChange={(e) =>
                setTaskForm({ ...taskForm, priority: e.target.value })
              }
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <select
              value={taskForm.assignedTo}
              onChange={(e) =>
                setTaskForm({ ...taskForm, assignedTo: e.target.value })
              }
            >
              <option value="">Assign to user</option>
              {project.members.map((member) => (
                <option key={member.user._id} value={member.user._id}>
                  {member.user.name} - {member.user.email}
                </option>
              ))}
            </select>

            <button type="submit">Create Task</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Tasks</h3>

        {tasks.length === 0 && <p>No tasks found.</p>}

        {tasks.map((task) => (
          <div className="task-card" key={task._id}>
            <h4>{task.title}</h4>
            <p>{task.description}</p>

            <p>
              <span className={`badge ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
              <span className="badge">{task.status}</span>
            </p>

            <p>
              <strong>Assigned To:</strong> {task.assignedTo?.name}
            </p>

            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(task.dueDate).toLocaleDateString()}
            </p>

            <select
              value={task.status}
              onChange={(e) => updateStatus(task._id, e.target.value)}
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>

            {isAdmin && (
              <button
                className="danger"
                style={{ marginLeft: 10 }}
                onClick={() => deleteTask(task._id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;