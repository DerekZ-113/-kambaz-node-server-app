import * as dao from "./dao.js";
import * as quizDao from "../Quizzes/dao.js";

export default function QuestionRoutes(app) {
    // Get all questions for a quiz
    app.get("/api/quizzes/:quizId/questions", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            
            // Check if quiz exists
            const quiz = await quizDao.findQuizById(quizId);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            
            // Students can only see questions for published quizzes
            if (!quiz.published && 
                (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN"))) {
                return res.status(403).json({ message: "Access denied: Quiz not published" });
            }
            
            const questions = await dao.findQuestionsByQuiz(quizId);
            res.json(questions);
        } catch (error) {
            console.error("Error fetching questions:", error);
            res.status(500).json({ message: "Error fetching questions" });
        }
    });

    // Get all questions for a quiz using courseId
    app.get("/api/courses/:cid/quizzes/:quizId/questions", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const cid = req.params.cid;
            console.log(`Looking for questions with quizId: ${quizId} in course: ${cid}`);
            
            // Check if quiz exists
            const quiz = await quizDao.findQuizById(quizId);
            console.log(`Quiz found: ${quiz ? 'Yes' : 'No'}`);
            
            if (!quiz) {
                console.log(`No quiz found with ID: ${quizId}`);
                // Get all quizzes to see what's available
                const allQuizzes = await quizDao.findAllQuizzes();
                console.log(`Available quizzes: ${allQuizzes.map(q => `${q._id} (${q.title})`).join(', ')}`);
                return res.status(404).json({ message: "Quiz not found" });
            }
            
            // Rest of your original code...
            
            const questions = await dao.findQuestionsByQuiz(quizId);
            console.log(`Found ${questions.length} questions for quiz ${quizId}`);
            res.json(questions);
        } catch (error) {
            console.error("Error fetching questions:", error);
            res.status(500).json({ message: "Error fetching questions" });
        }
    });
    
    // Get a specific question
    app.get("/api/questions/:questionId", async (req, res) => {
        try {
            const questionId = req.params.questionId;
            const question = await dao.findQuestionById(questionId);
            
            if (!question) {
                return res.status(404).json({ message: "Question not found" });
            }
            
            // Check access permissions via the associated quiz
            const quiz = await quizDao.findQuizById(question.quizId);
            const currentUser = req.session.currentUser;
            
            if (!quiz.published && 
                (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN"))) {
                return res.status(403).json({ message: "Access denied: Quiz not published" });
            }
            
            res.json(question);
        } catch (error) {
            console.error("Error fetching question:", error);
            res.status(500).json({ message: "Error fetching question" });
        }
    });
    
    // Create a new question
    app.post("/api/quizzes/:quizId/questions", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            
            // Only faculty can create questions
            if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Only faculty can create questions" });
            }
            
            // Check if quiz exists
            const quiz = await quizDao.findQuizById(quizId);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            
            // Find highest position to add new question at the end
            const questions = await dao.findQuestionsByQuiz(quizId);
            const highestPosition = questions.length > 0 
                ? Math.max(...questions.map(q => q.position)) 
                : -1;
            
            const newQuestion = await dao.createQuestion({
                ...req.body,
                quizId: quizId,
                position: highestPosition + 1
            });
            
            // Update quiz total points
            const totalPoints = await dao.calculateQuizTotalPoints(quizId);
            await quizDao.updateQuiz(quizId, { points: totalPoints });
            
            res.status(201).json(newQuestion);
        } catch (error) {
            console.error("Error creating question:", error);
            res.status(500).json({ message: "Error creating question", error: error.message });
        }
    });
    
    // Update a question
    app.put("/api/questions/:questionId", async (req, res) => {
        try {
            const questionId = req.params.questionId;
            const currentUser = req.session.currentUser;
            
            // Only faculty can update questions
            if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Only faculty can update questions" });
            }
            
            const question = await dao.findQuestionById(questionId);
            if (!question) {
                return res.status(404).json({ message: "Question not found" });
            }
            
            // Update the question
            const updatedQuestion = await dao.updateQuestion(questionId, req.body);
            
            // Update quiz total points
            const totalPoints = await dao.calculateQuizTotalPoints(question.quizId);
            await quizDao.updateQuiz(question.quizId, { points: totalPoints });
            
            res.json(updatedQuestion);
        } catch (error) {
            console.error("Error updating question:", error);
            res.status(500).json({ message: "Error updating question", error: error.message });
        }
    });
    
    // Delete a question
    app.delete("/api/questions/:questionId", async (req, res) => {
        try {
            const questionId = req.params.questionId;
            const currentUser = req.session.currentUser;
            
            // Only faculty can delete questions
            if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Only faculty can delete questions" });
            }
            
            const question = await dao.findQuestionById(questionId);
            if (!question) {
                return res.status(404).json({ message: "Question not found" });
            }
            
            const quizId = question.quizId;
            
            // Delete the question
            const deletedQuestion = await dao.deleteQuestion(questionId);
            
            // Update quiz total points
            const totalPoints = await dao.calculateQuizTotalPoints(quizId);
            await quizDao.updateQuiz(quizId, { points: totalPoints });
            
            // Reorder remaining questions to close gaps
            const remainingQuestions = await dao.findQuestionsByQuiz(quizId);
            const reorderedQuestions = remainingQuestions.map((q, index) => ({
                id: q._id,
                position: index
            }));
            await dao.reorderQuestions(quizId, reorderedQuestions);
            
            res.json(deletedQuestion);
        } catch (error) {
            console.error("Error deleting question:", error);
            res.status(500).json({ message: "Error deleting question" });
        }
    });
    
    // Reorder questions
    app.put("/api/quizzes/:quizId/questions/reorder", async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const currentUser = req.session.currentUser;
            const { questionOrder } = req.body;
            
            // Only faculty can reorder questions
            if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")) {
                return res.status(403).json({ message: "Only faculty can reorder questions" });
            }
            
            // Check if quiz exists
            const quiz = await quizDao.findQuizById(quizId);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            
            const reorderedQuestions = await dao.reorderQuestions(quizId, questionOrder);
            res.json(reorderedQuestions);
        } catch (error) {
            console.error("Error reordering questions:", error);
            res.status(500).json({ message: "Error reordering questions" });
        }
    });
}