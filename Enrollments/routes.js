import * as dao from "./dao.js";

export default function EnrollmentRoutes(app) {
  // Get all enrollments
  app.get("/api/enrollments", (req, res) => {
    const enrollments = dao.findAllEnrollments();
    res.json(enrollments);
  });
  
  // Get enrollments for a specific user
  app.get("/api/users/:userId/enrollments", (req, res) => {
    const userId = req.params.userId;
    const enrollments = dao.findUserEnrollments(userId);
    res.json(enrollments);
  });
  
  // Get users enrolled in a course
  app.get("/api/courses/:courseId/enrollments", (req, res) => {
    const courseId = req.params.courseId;
    const enrollments = dao.findCourseEnrollments(courseId);
    res.json(enrollments);
  });
  
  // Check if a user is enrolled in a course
  app.get("/api/users/:userId/courses/:courseId/enrollment", (req, res) => {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    const enrolled = dao.isEnrolled(userId, courseId);
    res.json({ enrolled });
  });
  
  // Enroll user in a course
  app.post("/api/users/:userId/enrollments/:courseId", (req, res) => {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    const enrollment = dao.enrollUserInCourse(userId, courseId);
    if (enrollment) {
      res.status(201).json(enrollment);
    } else {
      res.status(400).json({ message: "User is already enrolled in this course" });
    }
  });
  
  // Unenroll user from a course
  app.delete("/api/users/:userId/enrollments/:courseId", (req, res) => {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    const enrollment = dao.unenrollUserFromCourse(userId, courseId);
    if (enrollment) {
      res.json(enrollment);
    } else {
      res.status(404).json({ message: "Enrollment not found" });
    }
  });
}