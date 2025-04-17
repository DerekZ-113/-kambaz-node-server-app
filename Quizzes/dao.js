import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Finds all quizzes in the database
 * @returns {Promise<Array>} Array of quiz objects
 */
export const findAllQuizzes = async () => {
  try {
    return await model.find();
  } catch (error) {
    console.error("Error finding all quizzes:", error);
    throw error;
  }
};

/**
 * Finds quizzes associated with a specific course
 * @param {String} cid - Course ID
 * @returns {Promise<Array>} Array of quiz objects for the course
 */
export const findQuizzesByCourse = async (cid) => {
  try {
    return await model.find({ course: cid });
  } catch (error) {
    console.error(`Error finding quizzes for course ${cid}:`, error);
    throw error;
  }
};

/**
 * Finds a quiz by its ID
 * @param {String} quizId - Quiz ID
 * @returns {Promise<Object>} Quiz object if found, null otherwise
 */
export const findQuizById = async (quizId) => {
  try {
    return await model.findOne({ _id: quizId });
  } catch (error) {
    console.error(`Error finding quiz with ID ${quizId}:`, error);
    throw error;
  }
};

/**
 * Creates a new quiz with a generated UUID
 * @param {Object} quiz - Quiz object to create
 * @returns {Promise<Object>} Created quiz object
 */
export const createQuiz = async (quiz) => {
  try {
    // Generate a UUID for the new quiz
    const newQuiz = { 
      ...quiz,
      _id: uuidv4() // Add UUID as the _id
    };
    return await model.create(newQuiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
};

/**
 * Updates an existing quiz
 * @param {String} quizId - ID of quiz to update
 * @param {Object} quizUpdates - Object containing fields to update
 * @returns {Promise<Object>} Updated quiz object
 */
export const updateQuiz = async (quizId, quizUpdates) => {
  try {
    await model.updateOne(
      { _id: quizId },
      { $set: quizUpdates }
    );
    return await model.findOne({ _id: quizId });
  } catch (error) {
    console.error(`Error updating quiz ${quizId}:`, error);
    throw error;
  }
};

/**
 * Deletes a quiz
 * @param {String} quizId - ID of quiz to delete
 * @returns {Promise<Object>} Deleted quiz object
 */
export const deleteQuiz = async (quizId) => {
  try {
    const quiz = await findQuizById(quizId);
    if (!quiz) {
      throw new Error(`Quiz with ID ${quizId} not found`);
    }
    await model.deleteOne({ _id: quizId });
    return quiz;
  } catch (error) {
    console.error(`Error deleting quiz ${quizId}:`, error);
    throw error;
  }
};

/**
 * Publishes a quiz (sets published field to true)
 * @param {String} quizId - ID of quiz to publish
 * @returns {Promise<Object>} Updated quiz object
 */
export const publishQuiz = async (quizId) => {
  try {
    await model.updateOne(
      { _id: quizId },
      { $set: { published: true } }
    );
    return await model.findOne({ _id: quizId });
  } catch (error) {
    console.error(`Error publishing quiz ${quizId}:`, error);
    throw error;
  }
};

/**
 * Unpublishes a quiz (sets published field to false)
 * @param {String} quizId - ID of quiz to unpublish
 * @returns {Promise<Object>} Updated quiz object
 */
export const unpublishQuiz = async (quizId) => {
  try {
    await model.updateOne(
      { _id: quizId },
      { $set: { published: false } }
    );
    return await model.findOne({ _id: quizId });
  } catch (error) {
    console.error(`Error unpublishing quiz ${quizId}:`, error);
    throw error;
  }
};

/**
 * Finds published quizzes for a specific course
 * @param {String} cid - Course ID
 * @returns {Promise<Array>} Array of published quiz objects
 */
export const findPublishedQuizzesByCourse = async (cid) => {
  try {
    return await model.find({ course: cid, published: true });
  } catch (error) {
    console.error(`Error finding published quizzes for course ${cid}:`, error);
    throw error;
  }
};

/**
 * Finds quizzes created by a specific faculty member
 * @param {String} facultyId - Faculty user ID
 * @returns {Promise<Array>} Array of quiz objects created by the faculty
 */
export const findQuizzesByFaculty = async (facultyId) => {
  try {
    return await model.find({ creator: facultyId });
  } catch (error) {
    console.error(`Error finding quizzes for faculty ${facultyId}:`, error);
    throw error;
  }
};

export default {
  findAllQuizzes,
  findQuizzesByCourse,
  findQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  unpublishQuiz,
  findPublishedQuizzesByCourse,
  findQuizzesByFaculty
};