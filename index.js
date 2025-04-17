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
// Add imports for quiz-related routes
import QuizRoutes from './Quizzes/routes.js';
import QuestionRoutes from './Questions/routes.js';
import QuizAttemptRoutes from './QuizAttempts/routes.js';
import mongoose from "mongoose";
import MongoStore from "connect-mongo"; // You'll need to install this

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz"
mongoose.connect(CONNECTION_STRING);

const app = express();

// 1. First, add JSON parsing early
app.use(express.json());

// 2. Configure CORS properly - KEEP ONLY ONE CORS CONFIGURATION
app.use(
  cors({
    credentials: true,
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
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// 3. Add debugging middleware (keep this for troubleshooting)
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
    return origSetHeader.apply(this, arguments);
  };
  next();
});

// 4. REMOVE THE SECOND CORS MIDDLEWARE (comment out or delete this block)
// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (origin && (origin.match(/https:\/\/(.*--)?teal-bavarois-cb7f52\.netlify\.app/) || 
//                  origin === 'http://localhost:5173')) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   next();
// });

// 5. Session configuration (keep your existing code)
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false, 
  saveUninitialized: false,
  proxy: true // This is important for Render.com
};

// Production settings (keep your existing code)
if (process.env.NODE_ENV === "production") {
  sessionOptions.cookie = {
    sameSite: 'none',
    secure: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  };
  
  if (process.env.MONGO_CONNECTION_STRING) {
    sessionOptions.store = MongoStore.create({
      mongoUrl: process.env.MONGO_CONNECTION_STRING,
      ttl: 60 * 60 * 24 // 1 day
    });
  }
}

// 6. Use session middleware AFTER CORS, BEFORE ROUTES
app.use(session(sessionOptions));

// 7. Add routes after all middleware
Hello(app);
Lab5(app);
UserRoutes(app); 
CoursesRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
// Register quiz-related routes
QuizRoutes(app);
QuestionRoutes(app);
QuizAttemptRoutes(app);

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});