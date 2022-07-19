import express, { Router } from 'express';
import * as AuthController from './../controllers/AuthController'

export const AuthRouter:Router = express.Router();

AuthRouter.post("/signup" , AuthController.signUp)
