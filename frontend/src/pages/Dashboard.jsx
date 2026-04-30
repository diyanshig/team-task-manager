import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "../api/axios";

const Dashboard = () => {
  const { projectId } = useParams();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const { data } = await api.get(`/api/dashboard/project/${projectId}`);
      setDashboard(data);
    };

    fetchDashboard();
  }, [projectId]);

  if (!dashboard) {
    return <div className="container">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <p>
        <Link to={`/projects/${projectId}`}>← Back to Project</Link>
      </p>

      <h2>Dashboard</h2>

      <div className="grid grid-2">
        <div className="card">
          <h3>Total Tasks</h3>
          <h1>{dashboard.totalTasks}</h1>
        </div>

        <div className="card">
          <h3>Overdue Tasks</h3>
          <h1>{dashboard.overdueTasks}</h1>
        </div>
      </div>

      <div className="card">
        <h3>Tasks by Status</h3>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={dashboard.tasksByStatus}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Tasks per User</h3>

        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Tasks</th>
            </tr>
          </thead>

          <tbody>
            {dashboard.tasksPerUser.map((item) => (
              <tr key={item.userId}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;