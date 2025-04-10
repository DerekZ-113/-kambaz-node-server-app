import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    _id: String,
    title: String,
    description: String,
    points: Number,
    dueDate: Date,
    course: { type: String, ref: "CourseModel" },
    // Additional fields
    published: { type: Boolean, default: true },
    availableFrom: Date,
    availableUntil: Date,
    submissionType: {
      type: String,
      enum: ["TEXT", "FILE", "LINK", "NONE"],
      default: "NONE"
    }
  },
  { collection: "assignments" }
);

export default assignmentSchema;