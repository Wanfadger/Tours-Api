import express, { NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import hpp from  'hpp'
import { queryParser } from 'express-query-parser'


import { TourRouter } from './routes/TourRouter'
import { AuthRouter } from './routes/AuthRouter'
import { ApiError } from './utils/ApiError';
import { GlobalErrorHandler } from './utils/GlobalErrorHandler';
import {AuthGuard , RoleRestriction} from './controllers/AuthController'
import { Role } from '@prisma/client'
import { UserRouter } from './routes/UserRouter'



export const app:express.Application = express()
// SET SECURITY HTTP HEADERS
app.use(helmet())

// prevent http query pollution
app.use(hpp())

// SERIAL REQUEST payLoad
app.use(express.json())
app.use(morgan("dev"))
app.use(queryParser({
    parseBoolean: true,
    parseNull: true,
    parseNumber: true,
    parseUndefined: true,
}))

app.use("/api/auth" , AuthRouter  )
app.use("/api/users" ,AuthGuard, UserRouter)
app.use('/api/tours' , AuthGuard , RoleRestriction(Role.ADMIN , Role.LEAD_GUIDE) , TourRouter)

app.all("*" , (req:Request , res:Response , next:NextFunction) => 
    next(new ApiError(`Can't find ${req.originalUrl} on the server` , 404)))


/// global error handler
app.use(GlobalErrorHandler)
