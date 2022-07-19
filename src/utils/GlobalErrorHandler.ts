import { NextFunction, Request, Response } from "express"


export const  GlobalErrorHandler = (error:any , req:Request, res:Response , next:NextFunction) => {
  console.log(error)
  if(error.code === 'P2002'){
   return res.status(400).json({ 
      status:400,
      message:`Values for "${error.meta.target}" are creating duplicate values` 
    })
}

    res.status(error.statusCode).json({ 
        status:error.statusCode , 
        message:error.message 
      })
}