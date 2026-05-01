require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// ✅ Connect DB
connectDB();

// ✅ Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ✅ CORS FIX (FINAL – handles Railway + browser preflight)
const allowedOrigins = [
  "https://team-task-manager-production-cc91.up.railway.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests without origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ Test route
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running successfully" });
});

// ✅ Serve frontend (optional but safe)
const __dirnamePath = path.resolve();
app.use(express.static(path.join(__dirnamePath, "frontend/dist")));

// ✅ React fallback (IMPORTANT)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirnamePath, "frontend/dist", "index.html"));
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});