import express, { Request, Response } from 'express'
import morgan from 'morgan'
import { queryParser } from 'express-query-parser'


import { TourRouter } from './routes/TourRouter'


export const app:express.Application = express()
app.use(express.json())
app.use(morgan("dev"))
app.use(queryParser({
    parseBoolean: true,
    parseNull: true,
    parseNumber: true,
    parseUndefined: true,
}))


app.use('/api/tours' , TourRouter)

