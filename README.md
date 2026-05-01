# Team Task Manager

This is a full stack web app where users can create projects, assign tasks, and track progress.

## Features

* User signup and login
* Create and manage projects
* Add members to projects
* Create and assign tasks
* Update task status (To Do, In Progress, Done)
* Dashboard to view task stats

## Roles

* Admin: can create projects and manage users and tasks
* Member: can view and update their assigned tasks

## Tech Used

* Frontend: React (Vite), Tailwind CSS
* Backend: Node.js, Express
* Database: MongoDB
* Deployment: Railway

## How to run locally

Backend:

```
cd backend
npm install
npm run dev
```

Frontend:

```
cd frontend
npm install
npm run dev
```

## Environment Variables

Backend `.env`:

```
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
PORT=5000
```

## Deployment

Both frontend and backend are deployed on Railway.

## Live Demo

https://team-task-manager-production-cc91.up.railway.app/

---

Made by: Diyanshi Gupta
