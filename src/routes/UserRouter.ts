import express, { Router } from 'express';
import * as UserController from './../controllers/UserController'


export const UserRouter:Router = express.Router();

UserRouter.get('/' , UserController.allUsers)
UserRouter.get('/:id' , UserController.getUser)
