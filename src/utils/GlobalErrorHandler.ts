import { ApiError } from './ApiError';
import { NextFunction, Request, Response } from "express"

const handleJsonWebTokenError= (error:any) => new ApiError(error.message , 400)
const handleTokenExpiredError= (error:any) => new ApiError("Your authorization token has expired, please login again" , 400)

const handleDbUniqueViaoletionError= (error:any) => new ApiError(`Values for "${error.meta.target}" are creating duplicate values` , 400)


export const  GlobalErrorHandler = (error:any , req:Request, res:Response , next:NextFunction) => {
  if(process.env.NODE_ENV === 'development') {
    console.log(error)
  }
if(error.code === 'P2002') error = handleDbUniqueViaoletionError(error)
if(error.name === 'JsonWebTokenError') error = handleJsonWebTokenError(error)
if(error.name === 'TokenExpiredError') error = handleTokenExpiredError(error)

   error.statusCode = error.statusCode || 500

   if(error.isOperational){
    res.status(error.statusCode).json({ 
      status:error.statusCode, 
      message:error.message,
    })
   }else{
    res.status(error.statusCode).json({ 
      status:error.statusCode, 
      message:error.message,
    })
   }

  
}