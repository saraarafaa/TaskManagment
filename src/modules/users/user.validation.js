import Joi from "joi";
import { generalRules } from "../../utils/generalRules/generalRules.js";
import { userRole } from "../../DB/models/userModel.js";

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: generalRules.email.required(),
    password: generalRules.password,
    cPassword: Joi.string().valid(Joi.ref('password')).required(),
    role: Joi.string().valid(userRole.admin, userRole.user).required()
  })
}

export const loginSchema = {
  body: Joi.object({
    email: generalRules.email.required(),
    password: generalRules.password
  })
}

export const updateProfileSchema = {
  body: Joi.object({
    email: generalRules.email,
    name: Joi.string().min(3).max(30)
  })
}

export const deleteAccountSchema = {
  params: Joi.object({
    id: generalRules.id
  })
}

export const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: generalRules.password,
    newPassword: generalRules.password,
    cPassword: Joi.string().valid(Joi.ref('newPassword'))
  }).options({presence: 'required'})
}

export const forgetPasswordSchema = {
  body: Joi.object({
    email: generalRules.email
  }).options({presence: 'required'})
}

export const resetPasswordSchema = {
  body: Joi.object({
    email: generalRules.email,
    newPassword: generalRules.password,
    cPassword: Joi.string().valid(Joi.ref('newPassword')),
    OTP: Joi.string()
  }).options({presence: 'required'})
}

