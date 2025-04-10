import * as dao from "./dao.js";

export default function EnrollmentRoutes(app) {
  // Get all enrollments
  app.get("/api/enrollments", async (req, res) => {
    const enrollments = await dao.findAllEnrollments();
    res.json(enrollments);
  });
  
  // Get enrollments for a specific user
  app.get("/api/users/:userId/enrollments", async (req, res) => {
    const userId = req.params.userId;
    const enrollments = await dao.findUserEnrollments(userId);
    res.json(enrollments);
  });
  
  // Get users enrolled in a course
  app.get("/api/courses/:courseId/enrollments", async (req, res) => {
    const courseId = req.params.courseId;
    const enrollments = await dao.findCourseEnrollments(courseId);
    res.json(enrollments);
  });
  
  // Check if a user is enrolled in a course
  app.get("/api/users/:userId/courses/:courseId/enrollment", async (req, res) => {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    const enrolled = await dao.isEnrolled(userId, courseId);
    res.json({ enrolled });
  });
  
  // Enroll user in a course
  app.post("/api/users/:userId/enrollments/:courseId", async (req, res) => {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    try {
      const alreadyEnrolled = await dao.isEnrolled(userId, courseId);
      if (alreadyEnrolled) {
        return res.status(400).json({ message: "User is already enrolled in this course" });
      }
      
      const enrollment = await dao.enrollUserInCourse(userId, courseId);
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Unenroll user from a course
  app.delete("/api/users/:userId/enrollments/:courseId", async (req, res) => {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    try {
      const result = await dao.unenrollUserFromCourse(userId, courseId);
      if (result.deletedCount > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Enrollment not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}