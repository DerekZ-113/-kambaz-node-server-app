import model from "./model.js";
import { v4 as uuidv4 } from "uuid";
// Uncomment this when you create the enrollment model
// import enrollmentModel from "../Enrollments/model.js";

export function findAllCourses() {
  return model.find();
}

export async function findCoursesForEnrolledUser(userId) {
  // Temporary implementation until enrollment model is created
  console.log(`Finding courses for user: ${userId} (using temporary implementation)`);
  // Return all courses for now
  return model.find();
  
  // The full implementation will be:
  // const enrollments = await enrollmentModel.find({ user: userId });
  // const courseIds = enrollments.map(enrollment => enrollment.course);
  // return model.find({ _id: { $in: courseIds } });
}

export function createCourse(course) {
  // Generate UUID for new course
  const newCourse = { ...course, _id: uuidv4() };
  // Create a new course document in MongoDB
  return model.create(newCourse);
}

export function deleteCourse(courseId) {
  return model.deleteOne({ _id: courseId });
  // Note: When enrollment model is created, you'll need to handle enrollments separately
}

export function updateCourse(courseId, courseUpdates) {
  return model.updateOne({ _id: courseId }, { $set: courseUpdates });
  // Old implementation:
  // const { courses } = Database;
  // const course = courses.find((course) => course._id === courseId);
  // Object.assign(course, courseUpdates);
  // return course;
}
