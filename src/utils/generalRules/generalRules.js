import Joi from "joi";
import { Types } from "mongoose";

const customId = (value, helper) =>{
  const data = Types.ObjectId.isValid(value)
  return data? value: helper
}

export const generalRules = {
  email: Joi.string().email({tlds: {allow: ['com', 'org']}}),
  password: Joi.string().min(8).max(30).required(),
  id: Joi.string().custom(customId),
    file: Joi.object({
    size: Joi.number().positive().required(),
    path: Joi.string().required(),
    filename: Joi.string().required(),
    destination: Joi.string().required(),
    mimetype: Joi.string().required(),
    encoding: Joi.string().required(),
    originalname: Joi.string().required(),
    fieldname: Joi.string().required(),
  }).messages({
    "any.required": "file is required"
})
}