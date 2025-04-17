import * as dao from "./dao.js";
import * as quizDao from "../Quizzes/dao.js";
import { isAuthenticated, isFaculty } from "../middleware/auth.js";

export default function QuizAttemptRoutes(app) {
    // Start a new quiz attempt
    app.post("/api/courses/:cid/quizzes/:quizId/attempts", isAuthenticated, async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            
            // Enhanced error logging
            console.log("Creating attempt with user:", currentUser?._id);
            console.log("Quiz ID:", quizId);
            
            // Better validation
            if (!currentUser || !currentUser._id) {
                return res.status(401).json({ message: "You must be logged in to take a quiz" });
            }
            
            if (!quizId) {
                return res.status(400).json({ message: "Quiz ID is required" });
            }
            
            // Verify the quiz exists
            const quiz = await quizDao.findQuizById(quizId);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            
            // Start the new attempt
            const attempt = await dao.createAttempt(currentUser._id, quizId);
            res.status(201).json(attempt);
        } catch (error) {
            console.error("Error starting quiz attempt:", error);
            res.status(400).json({ message: error.message });
        }
    });
    
    // Get all quiz attempts for a specific quiz
    app.get("/api/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            
            // Verify user has permission to view all attempts (faculty only)
            if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Only faculty can view all attempts" });
            }
            
            const attempts = await dao.findAttemptsByQuiz(quizId);
            res.json(attempts);
        } catch (error) {
            console.error("Error fetching quiz attempts:", error);
            res.status(500).json({ message: "Error fetching quiz attempts" });
        }
    });
    
    // Get user's attempts for a specific quiz
    app.get("/api/quizzes/:quizId/my-attempts", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            
            // Must be logged in
            if (!currentUser) {
                return res.status(401).json({ message: "You must be logged in to view your attempts" });
            }
            
            const attempts = await dao.findAttemptsByUserAndQuiz(currentUser._id, quizId);
            res.json(attempts);
        } catch (error) {
            console.error("Error fetching user's quiz attempts:", error);
            res.status(500).json({ message: "Error fetching your quiz attempts" });
        }
    });
    
    // Get a specific quiz attempt
    app.get("/api/quiz-attempts/:attemptId", async (req, res) => {
        try {
            const attemptId = req.params.attemptId;
            const attempt = await dao.findAttemptById(attemptId);
            const currentUser = req.session.currentUser;
            
            if (!attempt) {
                return res.status(404).json({ message: "Attempt not found" });
            }
            
            // Only the user who made the attempt or faculty can view it
            if (!currentUser || 
                (currentUser._id !== attempt.userId && 
                 currentUser.role !== "FACULTY" && 
                 currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Access denied" });
            }
            
            res.json(attempt);
        } catch (error) {
            console.error("Error fetching quiz attempt:", error);
            res.status(500).json({ message: "Error fetching quiz attempt" });
        }
    });
    
    // Submit an answer for a question in an ongoing attempt
    app.post("/api/quiz-attempts/:attemptId/questions/:questionId", async (req, res) => {
        try {
            const { attemptId, questionId } = req.params;
            const { answer } = req.body;
            const currentUser = req.session.currentUser;
            
            // Must be logged in
            if (!currentUser) {
                return res.status(401).json({ message: "You must be logged in to submit answers" });
            }
            
            // Verify the attempt belongs to the current user
            const attempt = await dao.findAttemptById(attemptId);
            if (!attempt || attempt.userId !== currentUser._id) {
                return res.status(403).json({ message: "This is not your quiz attempt" });
            }
            
            // Submit the answer
            const updatedAttempt = await dao.submitAnswer(attemptId, questionId, answer);
            res.json(updatedAttempt);
        } catch (error) {
            console.error("Error submitting answer:", error);
            res.status(400).json({ message: error.message });
        }
    });
    
    // Complete/Submit a quiz attempt
    app.post("/api/quiz-attempts/:attemptId/submit", async (req, res) => {
        try {
            const attemptId = req.params.attemptId;
            const currentUser = req.session.currentUser;
            
            // Must be logged in
            if (!currentUser) {
                return res.status(401).json({ message: "You must be logged in to submit a quiz" });
            }
            
            // Verify the attempt belongs to the current user
            const attempt = await dao.findAttemptById(attemptId);
            if (!attempt || attempt.userId !== currentUser._id) {
                return res.status(403).json({ message: "This is not your quiz attempt" });
            }
            
            // Submit the attempt
            const submittedAttempt = await dao.submitAttempt(attemptId);
            res.json(submittedAttempt);
        } catch (error) {
            console.error("Error submitting quiz:", error);
            res.status(400).json({ message: error.message });
        }
    });
    
    // Get quiz grade for a user
    app.get("/api/quizzes/:quizId/grade", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            
            // Must be logged in
            if (!currentUser) {
                return res.status(401).json({ message: "You must be logged in to view your grade" });
            }
            
            const grade = await dao.getQuizGrade(currentUser._id, quizId);
            res.json(grade);
        } catch (error) {
            console.error("Error fetching quiz grade:", error);
            res.status(500).json({ message: "Error fetching quiz grade" });
        }
    });
    
    // Get quiz grade for a specific student (faculty only)
    app.get("/api/quizzes/:quizId/users/:userId/grade", async (req, res) => {
        try {
            const { quizId, userId } = req.params;
            const currentUser = req.session.currentUser;
            
            // Verify user has permission to view grades (faculty only)
            if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Only faculty can view student grades" });
            }
            
            const grade = await dao.getQuizGrade(userId, quizId);
            res.json(grade);
        } catch (error) {
            console.error("Error fetching student quiz grade:", error);
            res.status(500).json({ message: "Error fetching student quiz grade" });
        }
    });
}