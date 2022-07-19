import { PrismaClient } from "@prisma/client";
import { NextFunction , Response , Request} from "express";
import  bcrypt from "bcryptjs"


import { CreateUserDto } from './../dtos/user.dtos';


const prisma:PrismaClient = new PrismaClient()

export const signUp =  async (req:Request , res:Response , next:NextFunction) => {
    const user:CreateUserDto = req.body as CreateUserDto
  
    try {

      const savedUser =  await prisma.user.create({
            data:{
             name: user.name,
             email: user.email,
             photo: user.photo,
             password: await bcrypt.hash(user.password , bcrypt.genSaltSync(12))
            }
           })

           res.status(201).json({
            data:savedUser
           })
         
    } catch (error) {
        return next(error)
    }
  

}