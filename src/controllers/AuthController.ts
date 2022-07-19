import { PrismaClient, User } from "@prisma/client";
import { NextFunction, Response, Request } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs"
import * as Jwt from "jsonwebtoken";
import { ApiError } from './../utils/ApiError';
import { LoginDto, ResetPasswordDto , UpdatePasswordDto} from "./../dtos/auth.dtos";
import { CreateUserDto, UserDto , UpdateUserDto } from "./../dtos/user.dtos";
import { sendEmail } from "../utils/emailer";




const prisma: PrismaClient = new PrismaClient()

const genToken = (id: string): string => {
    return Jwt.sign({ id }, process.env.JWT_SECRET_KEY as string, { expiresIn: process.env.JWT_EXPIRES_IN })
}



export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const login: LoginDto = req.body
        if (!login.email && !login.password) {
            return next(new ApiError(`Please enter email and password`, 400))
        }

        const user = await prisma.user.findUnique({
            where: { email: login.email }
        })

        if (user && await bcrypt.compare(login.password, user.password)) {
            res.status(200).json({ token: genToken(user.id) })
        } else {
            return next(new ApiError(`Invalid email or password provided`, 400))
        }
    } catch (error) {
        next(error)
    }
}



export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    const user: CreateUserDto = req.body as CreateUserDto

    try {
        const savedUser = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                photo: user.photo,
                password: await bcrypt.hash(user.password, bcrypt.genSaltSync(Number(process.env.BCRYPT_SALT)))
            }
        })

        res.status(201).json({
            data: savedUser,
            token: genToken(savedUser.id)

        })


    } catch (error) {
        next(error)
    }
}


export const AuthGuard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        ///1) Check if the token is there
        let token: string | null = null
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return next(new ApiError(`You are not authorized to access, please login`, 401))
        }

        ///2) Check if the token is valid

        const verify = new Promise((resolve, reject) => {
            Jwt.verify(token as string, process.env.JWT_SECRET_KEY as string, (error, decoded) => {
                if (error) {
                    return reject(error);
                }
                return resolve(decoded);
            })
        })

        const payLoad = await verify as { id: string }

        ///3) Check if user still exists
        const user = await prisma.user.findUnique({ where: { id: payLoad.id }, select: { id: true, email: true, role: true } })
        if (!user) {
            return new ApiError(`User nolonger exits`, 401)
        }
        ///5) GRANT ACCESS to user
        req.body.user = user
        console.log(req.body)
        next()
    } catch (error) {
        return next(error)
    }

}

export const RoleRestriction = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user: UserDto = req.body.user as UserDto
        if (!roles.includes(user.role)) {
            return next(new ApiError("Your not allowed to perform this action", 403))
        }
        next()
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // TODO: Get user based on posted email address
        const fPassword = req.body

        const user: User | null = await prisma.user.findUnique({ where: { email: fPassword.email } })

        if (!user) {
            return next(new ApiError("User not found", 403))
        }

        // TODO: Generate random reset token
        const token: string = crypto.randomBytes(32).toString("hex")
        const rToken: string = crypto.createHash(process.env.RESET_PASSWORD_TOKEN_EXPIRES_ALOG as string).update(token).digest("hex")
        const expires: Date = new Date(Date.now() + 1000 * 60 * Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN)) // 10 minutes



        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { ...user, passwordResetToken: rToken, passwordResetExpires: expires }
        })

        if (!updated) {
            return next(new ApiError("Reset password token failed", 403))
        }


        const reqUrl: string = `${req.protocol}://${req.get("host")}/api/auth/resetPassword/${token}`

        // TODO: Send email notification
        const message: string = `Forgot your password? \n Submit a PUT request with your new password to ${reqUrl} \n If you didn't forgot your password, please ignore this email!`

        try {
            await sendEmail({ to: updated.email, from: process.env.EMAIL_FROM as string, subject: "RESET_PASSWORD_TOKEN_EXPIRES_IN 10 minutes", message: message })
        } catch (error) {
            await prisma.user.update({
                where: { id: user.id },
                data: { ...user, passwordResetToken: undefined, passwordResetExpires: undefined }
            })

            next(new ApiError("There was an error sending email, please try again later", 500))
        }

        res.status(200).json({
            mesage: "Rest link sent on your email address, expires in 10 minutes.",
        })
    } catch (error) {
        next(error)
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const rPassword: ResetPasswordDto = req.body as ResetPasswordDto
        const token: string = req.params.token
   
        // TODO: if toke exists
        if (!token) {
            return next(new ApiError("Token is missiong", 400))
        }
        // TODO: GET User based on the reset password token 
        const rToken: string = crypto.createHash(process.env.RESET_PASSWORD_TOKEN_EXPIRES_ALOG as string).update(token).digest("hex")
    
        const user = await prisma.user.findFirst({
            where: { passwordResetToken: rToken , passwordResetExpires:{gt:new Date(Date.now())} }
        })

        if (!user) {
            return next(new ApiError("Token is invalid or has expired", 400))
        }
    
    
        await prisma.user.update({
            where:{id: user.id},
            data:{...user , password:await bcrypt.hash(rPassword.password , bcrypt.genSaltSync(Number(process.env.BCRYPT_SALT)))  , passwordResetToken:null , passwordResetExpires:null}
        })

        // TODO: Log user in , send jwt token

        res.status(200).json({
            token:genToken(user.id)
        })
    } catch (error) {
        next(error)
    }
}


export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {

   try {
     // TODO: GET User
     const user:User = req.body.user;
     const dto:UpdatePasswordDto = req.body

     if(!dto.newPassword && !dto.password){
        return next(new ApiError("Missing update passwords", 400))
     }

     // TODO: CHECK Password Correct

     const updateUser:User| null = await prisma.user.findUnique({
        where: { id: user.id },
     })

     if(updateUser && !(await bcrypt.compare(dto.password , updateUser?.password))){
         return next(new ApiError("Invalid password", 403))
     }


    // TODO: UPDATE PASSWORD
    await prisma.user.update({
        where: { id: user.id },
        data: {...updateUser , password:await bcrypt.hash(dto.newPassword , bcrypt.genSaltSync(Number(process.env.BCRYPT_SALT)))}
    });

    res.status(200).json({
        token:genToken(user.id)
    })

   } catch (error) {
    next(error)
   }

}



export const updateMe = async (req: Request, res: Response, next: NextFunction) => {

    try {
      // TODO: GET User
      const user:User = req.body.user;
      const dto:UpdateUserDto = req.body

      let updateUser:User| null = await prisma.user.findUnique({
         where: { id: user.id },
      })

      if(dto.name){
        updateUser = {...updateUser , name:dto.name} as User
      }

      if(dto.photo){
        updateUser = {...updateUser , photo:dto.photo} as User
      }

      if(dto.role){
        updateUser = {...updateUser , role:dto.role} as User
      }
 
     // TODO: UPDATE PASSWORD
     await prisma.user.update({
         where: { id: user.id },
         data: {...updateUser }
     });
 
     res.status(200).json({
         message: 'User updated successfully',
     })
 
    } catch (error) {
     next(error)
    }
 
 }
 
