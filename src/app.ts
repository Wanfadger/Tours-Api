import express, { NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import { queryParser } from 'express-query-parser'


import { TourRouter } from './routes/TourRouter'
import { AuthRouter } from './routes/AuthRouter'
import { ApiError } from './utils/ApiError';
import { GlobalErrorHandler } from './utils/GlobalErrorHandler';
import {ValidateToken , RoleRestriction} from './controllers/AuthController'
import { Role } from '@prisma/client'



export const app:express.Application = express()
app.use(express.json())
app.use(morgan("dev"))
app.use(queryParser({
    parseBoolean: true,
    parseNull: true,
    parseNumber: true,
    parseUndefined: true,
}))

app.use("/api/auth" , AuthRouter  )
app.use('/api/tours' , ValidateToken , RoleRestriction(Role.ADMIN , Role.LEAD_GUIDE) , TourRouter)

app.all("*" , (req:Request , res:Response , next:NextFunction) => 
    next(new ApiError(`Can't find ${req.originalUrl} on the server` , 404)))


/// global error handler
app.use(GlobalErrorHandler)
