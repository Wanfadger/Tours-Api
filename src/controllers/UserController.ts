import { ApiError } from './../utils/ApiError';
import { PrismaClient, User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { UserDto } from './../dtos/user.dtos';

const prisma: PrismaClient = new PrismaClient();

export const allUsers = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const users: User[] = await prisma.user.findMany({
            where: { active: true }
        })

        const userList: UserDto[] = users.map(user => ({ id: user.id, name: user.name, email: user.email, photo: user.photo as string, role: user.role }));

        res.status(200).json(
            {
                count: userList.length,
                data: userList
            }
        )

    } catch (error) {
        next(error);
    }

}


export const getUser = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const id = req.params.id;


        const user: User | null = await prisma.user.findUnique({
            where: { id }
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