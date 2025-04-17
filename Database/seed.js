import quizzes from "./quizzes.js";
import questions from "./questions.js";
import * as quizDao from "../Quizzes/dao.js";
import * as questionDao from "../Questions/dao.js";
import mongoose from "mongoose";

// Configure mongoose
mongoose.connect('mongodb://127.0.0.1:27017/kambaz');

const seedDatabase = async () => {
  try {
    console.log("Beginning clean database reset...");
    
    // IMPORTANT: Clear ALL collections first
    await mongoose.connection.collection("quizzes").deleteMany({});
    await mongoose.connection.collection("questions").deleteMany({});
    await mongoose.connection.collection("quizAttempts").deleteMany({}); // Important to clear attempts
    await mongoose.connection.collection("courses").deleteMany({});
    
    console.log("All collections cleared. Adding new data with simple IDs...");
    
    // Insert quizzes with simple IDs
    for (const quiz of quizzes) {
      await quizDao.createQuiz(quiz);
      console.log(`Created quiz: ${quiz._id} - ${quiz.title}`);
    }
    
    // Insert questions with simple IDs
    for (const question of questions) {
      await questionDao.createQuestion(question);
      console.log(`Created question: ${question._id} - ${question.title} (for quiz: ${question.quizId})`);
    }
    
    // Verify after seeding
    console.log("\nVerifying seeded data:");
    const quizzesInDb = await mongoose.connection.collection("quizzes").find().toArray();
    console.log(`Found ${quizzesInDb.length} quizzes:`);
    quizzesInDb.forEach(q => console.log(`- ${q._id}: ${q.title}`));
    
    // Verify questions are linked properly
    for (const quiz of quizzesInDb) {
      const quizQuestions = await mongoose.connection.collection("questions")
        .find({ quizId: quiz._id }).toArray();
      console.log(`Quiz ${quiz._id} has ${quizQuestions.length} questions`);
    }
    
    console.log("\nSeeding completed successfully with simple IDs!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();