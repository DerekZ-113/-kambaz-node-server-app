import express from 'express';
import Hello from './Hello.js';
import Lab5 from './Lab5/index.js';
import cors from 'cors';
import UserRoutes from './Users/routes.js';
import session from "express-session";
import CoursesRoutes from './Courses/routes.js';
import "dotenv/config";
import ModuleRoutes from './Modules/routes.js';
import AssignmentRoutes from './Assignments/routes.js';
import EnrollmentRoutes from './Enrollments/routes.js';

const app = express();

// IMPORTANT: Check the Lab5/index.js - that module 
// likely contains another CORS middleware that's overriding ours

// Fix: Use a more explicit CORS configuration
app.use(
  cors({
    credentials: true,
    // Replace the hardcoded CORS origin with:
    origin: process.env.NETLIFY_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Keep the debugging middleware
app.use((req, res, next) => {
  console.log(`Request from: ${req.headers.origin} for ${req.path}`);
  const origSetHeader = res.setHeader;
  res.setHeader = function(name, value) {
    if(name === 'Access-Control-Allow-Origin') {
      console.log(`CORS Origin: ${value}`);
    }
    if(name === 'Access-Control-Allow-Credentials') {
      console.log(`CORS Credentials: ${value}`);
    }
    if(name === 'Access-Control-Allow-Origin' && value === '*') {
      console.trace("Wildcard CORS header being set here");
    }
    return origSetHeader.apply(this, arguments);
  };
  next();
});

// Ensure origin for all requests
app.use((req, res, next) => {
  // Force proper CORS for all responses
  res.setHeader('Access-Control-Allow-Origin', process.env.NETLIFY_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false, 
  saveUninitialized: false,
};

if (process.env.NODE_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_SERVER_DOMAIN,
  };
}

app.use(session(sessionOptions));
app.use(express.json());

// Add routes
Hello(app);
Lab5(app);
UserRoutes(app); 
CoursesRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app); // Add the enrollment routes

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});