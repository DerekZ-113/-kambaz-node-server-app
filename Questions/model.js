import mongoose from "mongoose";
import questionSchema, { 
  multipleChoiceSchema, 
  trueFalseSchema, 
  fillBlankSchema 
} from "./schema.js";

const baseModel = mongoose.model("QuestionModel", questionSchema);

// Create discriminator models for each question type
const models = {
  base: baseModel,
  MULTIPLE_CHOICE: baseModel.discriminator("MULTIPLE_CHOICE", multipleChoiceSchema),
  TRUE_FALSE: baseModel.discriminator("TRUE_FALSE", trueFalseSchema),
  FILL_BLANK: baseModel.discriminator("FILL_BLANK", fillBlankSchema)
};

export default models;