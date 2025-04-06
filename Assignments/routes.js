import * as dao from "./dao.js";

export default function AssignmentRoutes(app) {
    // Get all assignments
    app.get("/api/assignments", (req, res) => {
        const assignments = dao.findAllAssignments();
        res.json(assignments);
    });

    // Get assignments for a specific course
    app.get("/api/courses/:courseId/assignments", (req, res) => {
        const courseId = req.params.courseId;
        const assignments = dao.findAssignmentsByCourseName(courseId);
        res.json(assignments);
    });

    // Get a specific assignment
    app.get("/api/assignments/:assignmentId", (req, res) => {
        const assignmentId = req.params.assignmentId;
        const assignment = dao.findAssignmentById(assignmentId);
        res.json(assignment);
    });

    // Create a new assignment
    app.post("/api/courses/:courseId/assignments", (req, res) => {
        const assignment = dao.createAssignment({
            ...req.body,
            course: req.params.courseId
        });
        res.json(assignment);
    });

    // Update an assignment
    app.put("/api/assignments/:assignmentId", (req, res) => {
        const assignmentId = req.params.assignmentId;
        const status = dao.updateAssignment(assignmentId, req.body);
        res.json(status);
    });

    // Delete an assignment
    app.delete("/api/assignments/:assignmentId", (req, res) => {
        const assignmentId = req.params.assignmentId;
        const status = dao.deleteAssignment(assignmentId);
        res.json(status);
    });
}