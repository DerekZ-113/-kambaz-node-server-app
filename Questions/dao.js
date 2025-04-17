import models from "./model.js";
import { v4 as uuidv4 } from "uuid";

export async function findAllQuestions() {
  try {
    return await models.base.find();
  } catch (error) {
    console.error("Error finding all questions:", error);
    throw error;
  }
}

export async function findQuestionsByQuiz(quizId) {
  try {
    return await models.base.find({ quizId }).sort({ position: 1 });
  } catch (error) {
    console.error(`Error finding questions for quiz ${quizId}:`, error);
    throw error;
  }
}

export async function findQuestionById(questionId) {
  try {
    return await models.base.findOne({ _id: questionId });
  } catch (error) {
    console.error(`Error finding question with ID ${questionId}:`, error);
    throw error;
  }
}

export const createQuestion = async (question) => {
  try {
    // Generate a UUID for the new question
    const newQuestion = { 
      ...question,
      _id: uuidv4() // Add UUID as the _id
    };
    
    return await models.base.create(newQuestion);
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

export async function updateQuestion(questionId, questionUpdates) {
  try {
    // First find the existing question to get its type
    const existingQuestion = await findQuestionById(questionId);
    if (!existingQuestion) {
      throw new Error("Question not found");
    }
    
    // Update using the appropriate model
    await models[existingQuestion.questionType].updateOne(
      { _id: questionId },
      { $set: questionUpdates }
    );
    
    return await findQuestionById(questionId);
  } catch (error) {
    console.error(`Error updating question ${questionId}:`, error);
    throw error;
  }
}

export async function deleteQuestion(questionId) {
  try {
    const question = await findQuestionById(questionId);
    if (!question) {
      return null;
    }
    
    await models.base.deleteOne({ _id: questionId });
    return question;
  } catch (error) {
    console.error(`Error deleting question ${questionId}:`, error);
    throw error;
  }
}

export async function reorderQuestions(quizId, questionOrder) {
  try {
    // questionOrder is an array of {id: questionId, position: newPosition}
    const updateOperations = questionOrder.map(item => ({
      updateOne: {
        filter: { _id: item.id, quizId: quizId },
        update: { $set: { position: item.position } }
      }
    }));
    
    await models.base.bulkWrite(updateOperations);
    return await findQuestionsByQuiz(quizId);
  } catch (error) {
    console.error(`Error reordering questions for quiz ${quizId}:`, error);
    throw error;
  }
}

// Helper function to calculate total points for a quiz
export async function calculateQuizTotalPoints(quizId) {
  try {
    const questions = await findQuestionsByQuiz(quizId);
    return questions.reduce((total, question) => total + (question.points || 0), 0);
  } catch (error) {
    console.error(`Error calculating total points for quiz ${quizId}:`, error);
    throw error;
  }
}