import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export async function findAllAssignments() {
  return model.find();
}

export async function findAssignmentsByCourse(courseId) {
  return model.find({ course: courseId });
}

export async function findAssignmentById(assignmentId) {
  return model.findOne({ _id: assignmentId });
}

export async function createAssignment(assignment) {
  const newAssignment = { 
    ...assignment, 
    _id: uuidv4(),
    availableFrom: assignment.availableFrom || new Date(),
    dueDate: assignment.dueDate || new Date(),
    points: assignment.points || 100
  };
  return model.create(newAssignment);
}

export async function updateAssignment(assignmentId, assignmentUpdates) {
  await model.updateOne(
    { _id: assignmentId },
    { $set: assignmentUpdates }
  );
  return model.findOne({ _id: assignmentId });
}

export async function deleteAssignment(assignmentId) {
  const assignment = await findAssignmentById(assignmentId);
  await model.deleteOne({ _id: assignmentId });
  return assignment;
}