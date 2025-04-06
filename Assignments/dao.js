import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

export function findAllAssignments() {
  return Database.assignments;
}

export function findAssignmentsByCourseName(courseId) {
  return Database.assignments.filter(
    (assignment) => assignment.course === courseId
  );
}

export function findAssignmentById(assignmentId) {
  return Database.assignments.find(
    (assignment) => assignment._id === assignmentId
  );
}

export function createAssignment(assignment) {
  const newAssignment = { 
    ...assignment, 
    _id: uuidv4(),
    availableFrom: assignment.availableFrom || new Date().toISOString(),
    dueDate: assignment.dueDate || new Date().toISOString(),
    points: assignment.points || 100,
    modules: assignment.modules || ["Multiple Modules"]
  };
  Database.assignments = [...Database.assignments, newAssignment];
  return newAssignment;
}

export function updateAssignment(assignmentId, assignmentUpdates) {
  Database.assignments = Database.assignments.map((assignment) =>
    assignment._id === assignmentId
      ? { ...assignment, ...assignmentUpdates }
      : assignment
  );
  return findAssignmentById(assignmentId);
}

export function deleteAssignment(assignmentId) {
  const assignment = findAssignmentById(assignmentId);
  Database.assignments = Database.assignments.filter(
    (a) => a._id !== assignmentId
  );
  return assignment;
}