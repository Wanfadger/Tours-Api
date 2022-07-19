import { ApiError } from './../utils/ApiError';
import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { selectPrismaFields } from './../utils/util';

const prisma: PrismaClient = new PrismaClient();

export const allUsers = async (_req: Request, res: Response, next: NextFunction) => {

    try {
  
        const users  = await prisma.user.findMany({
            where: { active: true },
            select: {... selectPrismaFields('name' , 'id' , 'email' , 'photo' , 'role')}
        })

        res.status(200).json(
            {
                count: users.length,
                data: users
            }
        )

    } catch (error) {
        next(error);
    }

}


export const getUser = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const id = req.params.id;


        const user = await prisma.user.findUnique({
            where: { id },
            select: {... selectPrismaFields('name' , 'id' , 'email' , 'photo' , 'role')}
        })


        if (!user) {
            return next(new ApiError(`User not found`, 404));
        }


        res.status(200).json(
            {

                data: user
            }
        )

    } catch (error) {
        next(error);
    }

}