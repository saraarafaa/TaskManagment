import Joi from "joi";
import { generalRules } from "../../utils/generalRules/generalRules.js";

export const createTaskSchema = {
  body: Joi.object({
    title: Joi.string().min(5).required(),
    description: Joi.string().min(5).required(),
    status: Joi.string(),
    priority: Joi.string(),
    dueDate: Joi.date().min('now').optional(),
    createdBy: generalRules.id,
    assignedTo: generalRules.id,
  }),
  params: Joi.object({
    boardId: generalRules.id.required()
  }),
  files: Joi.array().items(generalRules.file).optional()
}

export const getTasksSchema = {
  params: Joi.object({
    boardId: generalRules.id.required()
  })
}

export const findTaskSchema = {
  params: Joi.object({
    boardId: generalRules.id.required(),
    id: generalRules.id.required()
  })
}

export const deleteTaskSchema = {
  params: Joi.object({
    boardId: generalRules.id.required(),
    id: generalRules.id.required()
  })
}

export const updateTaskSchema = {
  params: Joi.object({
    boardId: generalRules.id.required(),
    id: generalRules.id.required()
  }),
  body: Joi.object({
    title: Joi.string().min(5).optional(),
    description: Joi.string().min(5).optional(),
    status: Joi.string(),
    priority: Joi.string(),
    dueDate: Joi.date().min('now').optional(),
    assignedTo: generalRules.id,
  })
}