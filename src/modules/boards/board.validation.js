import Joi from "joi";
import { generalRules } from "../../utils/generalRules/generalRules.js";

export const createBoardSchema = {
  body: Joi.object({
    title: Joi.string().min(5).trim().required()
  })
}

export const getBoardSchema = {
  params: Joi.object({
    id: generalRules.id
  })
}

export const addMemberSchema = {
  params: Joi.object({
    id: generalRules.id
  }),
  body: Joi.object({
    userId: Joi.string().required()
  })
}

export const removeMemberSchema = {
  params: Joi.object({
    id: generalRules.id,
    userId: generalRules.id
  })
}

export const deleteBoardSchema = getBoardSchema