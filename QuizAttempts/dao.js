import model from "./model.js";
import { v4 as uuidv4 } from "uuid";
import * as questionDao from "../Questions/dao.js";
import * as quizDao from "../Quizzes/dao.js";

// Find all attempts for a specific quiz
export async function findAttemptsByQuiz(quizId) {
  return model.find({ quizId }).sort({ userId: 1, attemptNumber: -1 });
}

// Find all attempts for a specific user
export async function findAttemptsByUser(userId) {
  return model.find({ userId }).sort({ startTime: -1 });
}

// Find all attempts for a specific user and quiz
export async function findAttemptsByUserAndQuiz(userId, quizId) {
  return model.find({ userId, quizId }).sort({ attemptNumber: -1 });
}

// Find a specific attempt
export async function findAttemptById(attemptId) {
  return model.findOne({ _id: attemptId });
}

// Find the latest attempt for a user and quiz
export async function findLatestAttempt(userId, quizId) {
  return model.findOne({ userId, quizId }).sort({ attemptNumber: -1 });
}

// Create a new quiz attempt
export async function createAttempt(userId, quizId) {
  console.log("Creating attempt with:", { userId, quizId });
  
  // Validate inputs
  if (!userId) throw new Error("User ID is required");
  if (!quizId) throw new Error("Quiz ID is required");

  // Get quiz info to verify attempt is allowed
  const quiz = await quizDao.findQuizById(quizId);
  
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  
  if (!quiz.published) {
    throw new Error("Cannot attempt an unpublished quiz");
  }
  
  // Check if current date is within the quiz availability window
  const now = new Date();
  
  if (quiz.availableDate && now < new Date(quiz.availableDate)) {
    throw new Error("Quiz is not yet available");
  }
  
  if (quiz.untilDate && now > new Date(quiz.untilDate)) {
    throw new Error("Quiz is no longer available");
  }
  
  // Check if user has reached maximum attempts
  const existingAttempts = await findAttemptsByUserAndQuiz(userId, quizId);
  const attemptCount = existingAttempts.length;
  
  if (!quiz.multipleAttempts && attemptCount > 0) {
    throw new Error("Multiple attempts are not allowed for this quiz");
  }
  
  if (quiz.multipleAttempts && quiz.attemptsAllowed && attemptCount >= quiz.attemptsAllowed) {
    throw new Error(`Maximum number of attempts (${quiz.attemptsAllowed}) reached`);
  }
  
  // Create new attempt
  const newAttempt = {
    _id: uuidv4(),
    userId,
    quizId,
    startTime: new Date(),
    completed: false,
    score: 0,
    attemptNumber: attemptCount + 1,
    answers: []
  };
  
  return model.create(newAttempt);
}

// Submit an answer for a specific question in an attempt
export async function submitAnswer(attemptId, questionId, answer) {
  // Get the attempt
  const attempt = await findAttemptById(attemptId);
  if (!attempt) {
    throw new Error("Attempt not found");
  }
  
  if (attempt.completed) {
    throw new Error("Cannot modify a completed attempt");
  }
  
  // Get the question
  const question = await questionDao.findQuestionById(questionId);
  if (!question) {
    throw new Error("Question not found");
  }
  
  // Verify the question belongs to the quiz
  if (question.quizId !== attempt.quizId) {
    throw new Error("Question does not belong to this quiz");
  }
  
  // Check if answer already exists for this question
  const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
  
  // Determine if the answer is correct and calculate points
  let correct = false;
  let earnedPoints = 0;
  
  switch (question.questionType) {
    case "MULTIPLE_CHOICE":
      correct = answer === question.correctChoiceIndex;
      break;
    case "TRUE_FALSE":
      correct = answer === question.correctAnswer;
      break;
    case "FILL_BLANK":
      // Case insensitive check against possible answers
      const normalizedAnswer = answer.toString().toLowerCase().trim();
      correct = question.possibleAnswers.some(a => 
        a.toLowerCase().trim() === normalizedAnswer
      );
      break;
    default:
      throw new Error(`Unsupported question type: ${question.questionType}`);
  }
  
  if (correct) {
    earnedPoints = question.points;
  }
  
  // Create answer object
  const answerObject = {
    questionId,
    questionType: question.questionType,
    answer,
    correct,
    points: earnedPoints
  };
  
  // Update or add the answer
  if (existingAnswerIndex !== -1) {
    attempt.answers[existingAnswerIndex] = answerObject;
  } else {
    attempt.answers.push(answerObject);
  }
  
  // Save the updated attempt
  await model.updateOne(
    { _id: attemptId },
    { $set: { answers: attempt.answers } }
  );
  
  return findAttemptById(attemptId);
}

// Submit the entire quiz attempt (finish the quiz)
export async function submitAttempt(attemptId) {
  // Get the attempt
  const attempt = await findAttemptById(attemptId);
  if (!attempt) {
    throw new Error("Attempt not found");
  }
  
  if (attempt.completed) {
    throw new Error("Attempt already submitted");
  }
  
  // Calculate total score
  const totalScore = attempt.answers.reduce((sum, answer) => sum + (answer.points || 0), 0);
  
  // Mark as completed
  await model.updateOne(
    { _id: attemptId },
    {
      $set: {
        completed: true,
        endTime: new Date(),
        score: totalScore
      }
    }
  );
  
  return findAttemptById(attemptId);
}

// Get the grade for a quiz (highest score from all attempts)
export async function getQuizGrade(userId, quizId) {
  const attempts = await findAttemptsByUserAndQuiz(userId, quizId);
  
  if (attempts.length === 0) {
    return { score: 0, attempted: false };
  }
  
  // Find highest score
  const highestScoreAttempt = attempts.reduce(
    (highest, current) => (current.score > highest.score ? current : highest),
    attempts[0]
  );
  
  // Get the quiz to calculate percentage
  const quiz = await quizDao.findQuizById(quizId);
  const maxScore = quiz.points || 0;
  const percentage = maxScore > 0 ? (highestScoreAttempt.score / maxScore) * 100 : 0;
  
  return {
    score: highestScoreAttempt.score,
    maxScore,
    percentage,
    attempted: true,
    attemptCount: attempts.length,
    bestAttemptId: highestScoreAttempt._id
  };
}