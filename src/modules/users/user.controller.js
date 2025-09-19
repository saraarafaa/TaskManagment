import * as UV from "./user.validation.js";
import * as US from "./user.service.js";
import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { authentication } from "../../middleware/authentication.js";
import { authorization } from "../../middleware/authorization.js";
import { userRole } from "../../DB/models/userModel.js";

const userRouter = Router()

userRouter.post('/register', validation(UV.registerSchema), US.userRegister)
userRouter.post('/login', validation(UV.loginSchema), US.userLogin)
userRouter.get('/confirmEmail/:token', US.confirmEmail) 
userRouter.get('/profile', authentication, US.profile) 
userRouter.get('/getUsers', authentication, authorization(userRole.admin), US.getUsers) 
userRouter.delete('/deleteMe', authentication, US.deleteMe) 
userRouter.delete('/deleteAccount/:id', authentication,authorization(userRole.admin), validation(UV.deleteAccountSchema), US.deleteAccount) 
userRouter.patch('/updateProfile', authentication, validation(UV.updateProfileSchema), US.updateProfile) 
userRouter.post('/logout', authentication, US.userLogout) 
userRouter.post('/refreshToken', US.refreshToken) 
userRouter.patch('/updatePassword', authentication, validation(UV.updatePasswordSchema), US.updatePassword) 
userRouter.get('/forgetPassword', validation(UV.forgetPasswordSchema), US.forgetPassword) 
userRouter.patch('/resetPassword', validation(UV.resetPasswordSchema), US.resetPassword) 


export default userRouter