import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    _id: String,
    userId: { type: String, ref: "UserModel", required: true },
    quizId: { type: String, ref: "QuizModel", required: true },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    completed: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    attemptNumber: { type: Number, required: true },
    answers: [{
      questionId: { type: String, ref: "QuestionModel" },
      questionType: {
        type: String,
        enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_BLANK"]
      },
      answer: mongoose.Schema.Types.Mixed, // Can be number (index), boolean, or string
      correct: Boolean,
      points: Number
    }]
  },
  { collection: "quiz_attempts" }
);

// Index for quickly finding attempts by user and quiz
quizAttemptSchema.index({ userId: 1, quizId: 1, attemptNumber: 1 });

export default quizAttemptSchema;