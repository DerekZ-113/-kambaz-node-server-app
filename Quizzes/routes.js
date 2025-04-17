import * as dao from "./dao.js";
import { isAuthenticated, isFaculty, isStudent } from "../middleware/auth.js";

export default function QuizRoutes(app) {
    // Get all quizzes - only accessible by faculty
    app.get("/api/quizzes", isAuthenticated, async (req, res) => {
        try {
            const quizzes = await dao.findAllQuizzes();
            res.json(quizzes);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            res.status(500).json({ message: "Error fetching quizzes" });
        }
    });

    // Get quizzes for a specific course - accessible by both roles but shows different content
    app.get("/api/courses/:cid/quizzes", isAuthenticated, async (req, res) => {
        try {
            const cid = req.params.cid;
            const currentUser = req.session.currentUser;
            
            // Faculty can see all quizzes, students only published ones
            let quizzes;
            if (currentUser.role === "FACULTY" || currentUser.role === "ADMIN") {
                quizzes = await dao.findQuizzesByCourse(cid);
            } else {
                quizzes = await dao.findPublishedQuizzesByCourse(cid);
            }
            res.json(quizzes);
        } catch (error) {
            console.error("Error fetching course quizzes:", error);
            res.status(500).json({ message: "Error fetching course quizzes" });
        }
    });

    // Add similar debugging to your quizzes listing route
    app.get("/api/courses/:cid/quizzes", async (req, res) => {
        try {
            const cid = req.params.cid;
            console.log(`Getting quizzes for course: ${cid}`);
            
            const quizzes = await dao.findQuizzesByCourse(cid);
            console.log(`Found ${quizzes.length} quizzes:`);
            quizzes.forEach(q => console.log(`- ${q._id}: ${q.title}`));
            
            res.json(quizzes);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            res.status(500).json({ message: "Error fetching quizzes" });
        }
    });

    // Get a specific quiz
    app.get("/api/quizzes/:quizId", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const quiz = await dao.findQuizById(quizId);
            
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }

            const currentUser = req.session.currentUser;
            // Only allow access if quiz is published or user is faculty/admin
            if (!quiz.published && 
                (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN"))) {
                return res.status(403).json({ message: "Access denied: Quiz not published" });
            }
            
            res.json(quiz);
        } catch (error) {
            console.error("Error fetching quiz:", error);
            res.status(500).json({ message: "Error fetching quiz" });
        }
    });

    // Create a new quiz - only faculty can do this
    app.post("/api/courses/:cid/quizzes", isAuthenticated, isFaculty, async (req, res) => {
        try {
            const currentUser = req.session.currentUser;
            
            const quiz = await dao.createQuiz({
                ...req.body,
                course: req.params.cid,
                creator: currentUser._id
            });
            res.status(201).json(quiz);
        } catch (error) {
            console.error("Error creating quiz:", error);
            res.status(500).json({ message: "Error creating quiz" });
        }
    });

    // Update a quiz
    app.put("/api/quizzes/:quizId", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            
            if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Only faculty can update quizzes" });
            }
            
            const updatedQuiz = await dao.updateQuiz(quizId, req.body);
            if (!updatedQuiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            res.json(updatedQuiz);
        } catch (error) {
            console.error("Error updating quiz:", error);
            res.status(500).json({ message: "Error updating quiz" });
        }
    });

    // Delete a quiz
    app.delete("/api/quizzes/:quizId", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            
            if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Only faculty can delete quizzes" });
            }
            
            const deletedQuiz = await dao.deleteQuiz(quizId);
            if (!deletedQuiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            res.json(deletedQuiz);
        } catch (error) {
            console.error("Error deleting quiz:", error);
            res.status(500).json({ message: "Error deleting quiz" });
        }
    });

    // Publish a quiz
    app.put("/api/quizzes/:quizId/publish", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            
            if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Only faculty can publish quizzes" });
            }
            
            const publishedQuiz = await dao.publishQuiz(quizId);
            if (!publishedQuiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            res.json(publishedQuiz);
        } catch (error) {
            console.error("Error publishing quiz:", error);
            res.status(500).json({ message: "Error publishing quiz" });
        }
    });

    // Unpublish a quiz
    app.put("/api/quizzes/:quizId/unpublish", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            
            if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Only faculty can unpublish quizzes" });
            }
            
            const unpublishedQuiz = await dao.unpublishQuiz(quizId);
            if (!unpublishedQuiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            res.json(unpublishedQuiz);
        } catch (error) {
            console.error("Error unpublishing quiz:", error);
            res.status(500).json({ message: "Error unpublishing quiz" });
        }
    });
}