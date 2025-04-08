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
import mongoose from "mongoose";

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz"
mongoose.connect(CONNECTION_STRING);

const app = express();

// IMPORTANT: Check the Lab5/index.js - that module 
// likely contains another CORS middleware that's overriding ours

// Fix: Use a more explicit CORS configuration
app.use(
  cors({
    credentials: true,
    // Make CORS more flexible with function
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin matches Netlify domain (with or without branch prefix)
      if (origin.match(/https:\/\/(.*--)?teal-bavarois-cb7f52\.netlify\.app/)) {
        return callback(null, true);
      }
      
      // Allow localhost for development
      if (origin === 'http://localhost:5173') {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
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
  // Force proper CORS for all responses - use the requesting origin if it's allowed
  const origin = req.headers.origin;
  if (origin && (origin.match(/https:\/\/(.*--)?teal-bavarois-cb7f52\.netlify\.app/) || 
                 origin === 'http://localhost:5173')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
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
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
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