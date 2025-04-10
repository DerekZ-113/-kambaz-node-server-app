import model from "./model.js";

export async function findAllEnrollments() {
  return model.find();
}

export async function findCoursesForUser(userId) {
  const enrollments = await model.find({ user: userId }).populate("course");
  return enrollments.map((enrollment) => enrollment.course);
}

export async function findUsersForCourse(courseId) {
  const enrollments = await model.find({ course: courseId }).populate("user");
  
  // Make sure we handle different user data formats correctly
  return enrollments.map((enrollment) => {
    // The populated user object might be in various formats depending on Mongoose
    if (enrollment.user) {
      // If it's a document with _doc, extract the actual user data
      if (enrollment.user._doc) {
        return enrollment.user._doc;
      }
      // Otherwise return the user object directly
      return enrollment.user;
    }
    // Fallback for unpopulated data
    return { _id: enrollment.user };
  });
}

// Add missing functions used in routes.js
export async function findUserEnrollments(userId) {
  return model.find({ user: userId });
}

export async function findCourseEnrollments(courseId) {
  return model.find({ course: courseId });
}

export async function isEnrolled(userId, courseId) {
  const enrollment = await model.findOne({ user: userId, course: courseId });
  return enrollment !== null;
}

export const enrollUserInCourse = async (userId, courseId) => {
  const enrollmentId = `${userId}-${courseId}`;
  
  // Perform the update
  await model.updateOne(
    { _id: enrollmentId },
    { 
      $set: { 
        user: userId, 
        course: courseId,
        enrollmentDate: new Date() // Add enrollment date
      } 
    },
    { upsert: true }
  );
  
  // Return a properly formatted enrollment document
  return {
    _id: enrollmentId,
    user: userId,
    course: courseId,
    enrollmentDate: new Date(),
    status: "ENROLLED"
  };
};

export function unenrollUserFromCourse(user, course) {
  return model.deleteOne({ user, course });
}

