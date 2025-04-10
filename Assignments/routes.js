import * as dao from "./dao.js";

export default function AssignmentRoutes(app) {
    // Get all assignments
    app.get("/api/assignments", async (req, res) => {
        try {
            const assignments = await dao.findAllAssignments();
            res.json(assignments);
        } catch (error) {
            console.error("Error fetching assignments:", error);
            res.status(500).json({ message: "Error fetching assignments" });
        }
    });

    // Get assignments for a specific course
    app.get("/api/courses/:courseId/assignments", async (req, res) => {
        try {
            const courseId = req.params.courseId;
            const assignments = await dao.findAssignmentsByCourse(courseId);
            res.json(assignments);
        } catch (error) {
            console.error("Error fetching course assignments:", error);
            res.status(500).json({ message: "Error fetching course assignments" });
        }
    });

    // Get a specific assignment
    app.get("/api/assignments/:assignmentId", async (req, res) => {
        try {
            const assignmentId = req.params.assignmentId;
            const assignment = await dao.findAssignmentById(assignmentId);
            if (!assignment) {
                return res.status(404).json({ message: "Assignment not found" });
            }
            res.json(assignment);
        } catch (error) {
            console.error("Error fetching assignment:", error);
            res.status(500).json({ message: "Error fetching assignment" });
        }
    });

    // Create a new assignment
    app.post("/api/courses/:courseId/assignments", async (req, res) => {
        try {
            const assignment = await dao.createAssignment({
                ...req.body,
                course: req.params.courseId
            });
            res.status(201).json(assignment);
        } catch (error) {
            console.error("Error creating assignment:", error);
            res.status(500).json({ message: "Error creating assignment" });
        }
    });

    // Update an assignment
    app.put("/api/assignments/:assignmentId", async (req, res) => {
        try {
            const assignmentId = req.params.assignmentId;
            const updatedAssignment = await dao.updateAssignment(assignmentId, req.body);
            if (!updatedAssignment) {
                return res.status(404).json({ message: "Assignment not found" });
            }
            res.json(updatedAssignment);
        } catch (error) {
            console.error("Error updating assignment:", error);
            res.status(500).json({ message: "Error updating assignment" });
        }
    });

    // Delete an assignment
    app.delete("/api/assignments/:assignmentId", async (req, res) => {
        try {
            const assignmentId = req.params.assignmentId;
            const deletedAssignment = await dao.deleteAssignment(assignmentId);
            if (!deletedAssignment) {
                return res.status(404).json({ message: "Assignment not found" });
            }
            res.json(deletedAssignment);
        } catch (error) {
            console.error("Error deleting assignment:", error);
            res.status(500).json({ message: "Error deleting assignment" });
        }
    });
}