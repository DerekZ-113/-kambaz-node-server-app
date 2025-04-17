import mongoose from "mongoose";

// Base schema with common fields for all question types
const baseQuestionFields = {
  _id: String,
  quizId: { type: String, ref: "QuizModel" },
  title: String,
  points: { type: Number, default: 1 },
  // Remove questionType from here since it will be the discriminator key
  questionText: String,
  position: { type: Number, default: 0 } // To maintain question order in quiz
};

// Multiple choice question schema
const multipleChoiceSchema = new mongoose.Schema({
  ...baseQuestionFields,
  choices: [{
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    text: String
  }],
  correctChoiceIndex: Number
});

// True/False question schema
const trueFalseSchema = new mongoose.Schema({
  ...baseQuestionFields,
  correctAnswer: Boolean
});

// Fill in the blank question schema
const fillBlankSchema = new mongoose.Schema({
  ...baseQuestionFields,
  possibleAnswers: [String] // Array of possible correct answers
});

// Create a discriminator schema to handle different question types
const questionSchema = new mongoose.Schema(
  baseQuestionFields,
  { 
    collection: "questions",
    discriminatorKey: "questionType"
  }
);

export default questionSchema;
export { multipleChoiceSchema, trueFalseSchema, fillBlankSchema };