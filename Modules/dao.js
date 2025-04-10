import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export async function findModulesForCourse(courseId) {
  return model.find({ course: courseId });
}

export async function createModule(module) {
  const newModule = { ...module, _id: module._id || uuidv4() };
  return model.create(newModule);
}

export async function deleteModule(moduleId) {
  return model.deleteOne({ _id: moduleId });
}

export async function updateModule(moduleId, moduleUpdates) {
  return model.updateOne({ _id: moduleId }, { $set: moduleUpdates });
}
