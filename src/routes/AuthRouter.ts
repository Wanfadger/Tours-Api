import express, { Router } from 'express';
import * as AuthController from './../controllers/AuthController'


export const AuthRouter:Router = express.Router();

AuthRouter.post("/signup" , AuthController.signUp)
AuthRouter.post("/login" , AuthController.login)
AuthRouter.post("/forgotPassword" , AuthController.forgotPassword)
AuthRouter.put("/resetPassword/:token" , AuthController.resetPassword)
AuthRouter.put("/updatePassword" ,AuthController.AuthGuard , AuthController.updatePassword)
AuthRouter.put("/updateMe" ,AuthController.AuthGuard , AuthController.updateMe)
