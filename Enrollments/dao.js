import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

// Get all enrollments
export function findAllEnrollments() {
  return Database.enrollments;
}

// Get enrollments for a specific user
export function findUserEnrollments(userId) {
  return Database.enrollments.filter(
    (enrollment) => enrollment.user === userId
  );
}

// Get users enrolled in a course
export function findCourseEnrollments(courseId) {
  return Database.enrollments.filter(
    (enrollment) => enrollment.course === courseId
  );
}

// Check if a user is enrolled in a course
export function isEnrolled(userId, courseId) {
  return Database.enrollments.some(
    (enrollment) => enrollment.user === userId && enrollment.course === courseId
  );
}

// Enroll a user in a course
export function enrollUserInCourse(userId, courseId) {
  // Check if already enrolled
  if (isEnrolled(userId, courseId)) {
    return null;
  }
  
  const newEnrollment = {
    _id: uuidv4(),
    user: userId,
    course: courseId
  };
  
  Database.enrollments.push(newEnrollment);
  return newEnrollment;
}

// Unenroll a user from a course
export function unenrollUserFromCourse(userId, courseId) {
  const enrollmentToRemove = Database.enrollments.find(
    (enrollment) => enrollment.user === userId && enrollment.course === courseId
  );
  
  if (enrollmentToRemove) {
    Database.enrollments = Database.enrollments.filter(
      (enrollment) => !(enrollment.user === userId && enrollment.course === courseId)
    );
    return enrollmentToRemove;
  }
  
  return null;
}

