
import { PrismaClient, User } from "@prisma/client";
import { NextFunction , Response , Request} from "express";
import crypto from "crypto";
import  bcrypt from "bcryptjs"
import * as Jwt from "jsonwebtoken";
import { ApiError } from './../utils/ApiError';


import { CreateUserDto, LoginDto, UserDto } from './../dtos/user.dtos';



const prisma:PrismaClient = new PrismaClient()

const genToken = (id:string):string => {
    return Jwt.sign({id} , process.env.JWT_SECRET_KEY as string , {expiresIn:process.env.JWT_EXPIRES_IN})
}



export const login = async (req:Request , res:Response  , next:NextFunction) => {
    try {
        const login:LoginDto = req.body
        if(!login.email && !login.password){
          return next(new ApiError(`Please enter email and password` , 400))
        }

      const user = await prisma.user.findUnique({
            where:{email:login.email}
        })

        if(user && await bcrypt.compare(login.password, user.password)){
            res.status(200).json({token: genToken(user.id)})
        }else{
            return next(new ApiError(`Invalid email or password provided` , 400))
        }
    } catch (error) {
        next(error)
    }
}



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
            data:savedUser,
            token: genToken(savedUser.id)
                
            })
        
         
    } catch (error) {
         next(error)
    }
}


export const ValidateToken = async (req:Request , res:Response , next:NextFunction) => {
try {
        ///1) Check if the token is there
   let token:string | null = null
   if(req.headers.authorization &&  req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(' ')[1]
   }

   if(!token) {
    return next(new ApiError(`You are not authorized to access, please login` , 401))
   }

   ///2) Check if the token is valid
   
  const verify = new Promise((resolve, reject) => {
    Jwt.verify(token as string , process.env.JWT_SECRET_KEY as string , (error , decoded) => {
        if(error) {
        return reject(error);
        }
       return resolve(decoded);
    })
  })

  const payLoad = await verify as {id:string}

   ///3) Check if user still exists
   const user = await prisma.user.findUnique({where:{id:payLoad.id} , select:{id:true , email:true , role:true}})
   if (!user) {
    return new ApiError(`User nolonger exits` , 401)
   }
   ///5) GRANT ACCESS to user
   req.body.user = user
   console.log(req.body)
   next()
} catch (error) {
   return next(error)
}

}

export const RoleRestriction =  (...roles:string[]) => {
    return  (req:Request , res:Response , next:NextFunction) => {
      const user:UserDto = req.body.user as UserDto
      if(!roles.includes(user.role)){
       return next(new ApiError("Your not allowed to perform this action" , 403))
      }
      next()
    }
}

export const forgotPassword = async (req:Request, res:Response , next:NextFunction) => {
   try {
    // TODO: Get user based on posted email address
    const fPassword = req.body

    const user:User|null = await prisma.user.findUnique({where: {email: fPassword.email}})
     
    if (!user) {
        return next(new ApiError("User not found" , 403))
    }

   // TODO: Generate random reset token
   const token = crypto.randomBytes(32).toString("hex")
   const rToken = crypto.createHash(process.env.RESET_PASSWORD_TOKEN_EXPIRES_ALOG as string).update(token).digest("hex")
   const expires:Date = new Date(Date.now() + 1000*60*Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN)) // 10 minutes
   
   

   const updated = await prisma.user.update({
    where:{id:user.id},
    data:{...user, passwordResetToken:rToken ,passwordResetExpires:expires }
   })

   if(!updated){
    return next(new ApiError("Reset password token failed" , 403))
   }


   // TODO: Send email notification

   res.status(200).json({
    "mesage":"link sent on your email address"
   })
   } catch (error) {
    next(error)
   }
}

export const resetPassword = (req:Request, res:Response , next:NextFunction) => {

    
 
 }