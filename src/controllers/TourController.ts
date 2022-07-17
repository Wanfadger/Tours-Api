
import { CreateTourDto, SearchQueryParams } from './../dtos/tour-dtos';
import { NextFunction, query, Request, Response } from "express";

import { Difficulty, PrismaClient, Tour } from "@prisma/client";
import { data , UniqueViolationException } from '../utils/exceptions.util';
import { join } from 'path';
import { kMaxLength } from 'buffer';

const prisma:PrismaClient = new PrismaClient();

export const createTour = async (req:Request , res:Response , next:NextFunction) => {
    const tour:CreateTourDto = req.body
  
    try{
      const savedTour:Tour = await prisma.tour.create({data:{
            name: tour.name,
            price: tour.price,
            rating: tour.rating,
            priceDiscount: tour.priceDiscount,
            summary: tour.summary,
            duration: tour.duration,
            description: tour.description,
            difficulty: tour.difficulty == "EASY" ? Difficulty.EASY : tour.difficulty == "MEDIUM" ? Difficulty.MEDIUM : Difficulty.DIFFICULT,
            imageCover: tour.imageCover,
            images: tour.images,
            maxGroupSize: tour.maxGroupSize,
            startDates: tour.startDates.map(d => new Date(d)),
            endDates: tour.endDates.map(d => new Date(d)),
        }})

        res.status(201).json({
            data:savedTour,
            message:"Successfully created tour",
         })

    }catch(error:any){
        // console.error(error)
        if(error.code === 'P2002'){
          res.status(400).json({error:new UniqueViolationException(`Values for "${error.meta.target}" are creating duplicate values`).message, 
        t:error
        })
        }else{
            next(error);
        }
    }


};


export const getTours = async (req:Request , res:Response , next:NextFunction) => {
      const queryObj = {...req.query}

      let excludeQuery:string[] = ['page' , 'sort' , 'limit' , 'fields']

     // excludeQuery.forEach(query => (delete queryObj[query]))

      console.log(queryObj)
      let sortQuery :{[key: string]: string}[] | null = null
      if(queryObj && queryObj.sort){
        console.log(queryObj.sort)
        if(typeof queryObj.sort === 'string'){
            const sortKeys = (queryObj.sort).split(',')  
            sortQuery = sortKeys.map((k:string) => {
                const query:{[key: string]: string} = {[k]:'asc'}
                return query
            })
            console.log(sortKeys)
        }else{
            const sortDirection = Object.keys(queryObj.sort as any).length > 0 ? Object.keys(queryObj.sort as any)[0] : 'asc'
            console.log(sortDirection)
            const keyString = (<any>queryObj.sort)[sortDirection]
            const sortKeys = keyString.split(',')

            sortQuery = sortKeys.map((k:string) => {
                const query:{[key: string]: string} = {[k]:sortDirection}
                return query
            })
        }
      }

      let durationQuery:{[key: string]: string} = queryObj.duration as {[key: string]: string}

      console.log(durationQuery)
      console.log(sortQuery)


    try {
        let  tours :Tour[] = []
       /// sort and duration
        if(queryObj && (queryObj.sortDirection || queryObj.duration)) {
            tours =   await prisma.tour.findMany({
                orderBy:[...(sortQuery as [])],
                where:{duration:queryObj.duration as any}
            }) 
            res.status(200).json({
                message:"success",
                count:tours.length,
                data:tours
            });

        }else if(queryObj &&  queryObj.duration){
          
            tours =  await await prisma.tour.findMany({
                where:{duration: {... queryObj.duration as any}}
            }) 
            res.status(200).json({
                message:"success",
                count:tours.length,
                data:tours
            });
        }else if(queryObj &&  queryObj.sort){
          
            tours =  await await prisma.tour.findMany({
                orderBy:[...(sortQuery as [])],
            }) 
            res.status(200).json({
                message:"success",
                count:tours.length,
                data:tours
            });
        }else{
            tours =  await await prisma.tour.findMany() 
            res.status(200).json({
                message:"success",
                count:tours.length,
                data:tours
            });
        }


          

        

    } catch (error) {
        next(error);
    }
};


const getTourById = async (id:string):Promise<Tour|null> => {
    return await prisma.tour.findUnique({ 
        where: { id: id}
    });
}

export const getTour = async (req:Request , res:Response , next:NextFunction) => {
    const id = req.params.id;
    try {
       const tour:Tour|null = await getTourById(id);

        if (!tour) {
            res.status(404).json({ message: `No tour found matching ${id}` });
        }
        
        res.status(200).json({data:tour})

    } catch (error) {
        next(error);
    }

   
};



export const updateTour = async (req:Request , res:Response , next:NextFunction) => {
    const id = req.params.id;
    const tour:CreateTourDto = req.body
    try {

        if (!(await getTourById(id))) {
            res.status(404).json({ message: `No tour found matching ${id}` });
        }

       const updatedTour:Tour|null = await prisma.tour.update({ 
            where: { id: id},
            data: { name:tour.name  , rating: tour.rating , price: tour.price}
        });
        
        res.status(200).json({data:updatedTour})

    } catch (error) {
        next(error);
    }
};


export const deleteTour = async (req:Request , res:Response , next:NextFunction) => {
    const id = req.params.id;
    try {
        if (!(await getTourById(id))) {
            res.status(404).json({ message: `No tour found matching ${id}` });
        }
        await prisma.tour.delete({where: {id}});
        res.status(204).json({ message: `successfully deleted tour` });
    } catch (error) {
        next(error); 
    }
};


export const loadTours  =  async (req:Request , res:Response , next:NextFunction) => {
  
    try{
     
        const dd:CreateTourDto[] = data
        
        await prisma.tour.createMany({
            data: [... dd.map(tour => ({
                name: tour.name,
                price: tour.price,
                rating: tour.rating,
                priceDiscount: tour.priceDiscount,
                summary: tour.summary,
                duration: tour.duration,
                description: tour.description,
                difficulty: tour.difficulty == "EASY" ? Difficulty.EASY : tour.difficulty == "MEDIUM" ? Difficulty.MEDIUM : Difficulty.DIFFICULT,
                imageCover: tour.imageCover,
                images: tour.images,
                maxGroupSize: tour.maxGroupSize,
                startDates: tour.startDates.map(d => new Date(d)),
                endDates: tour.endDates.map(d => new Date(d)),
            }))]
        })
        
        res.json({
            message:`Successfully created tours ${dd.length}`
        })

    }catch(error:any){
        // console.error(error)
        if(error.code === 'P2002'){
          res.status(400).json({error:new UniqueViolationException(`Values for "${error.meta.target}" are creating duplicate values`).message, 
        t:error
        })
        }else{
            next(error);
        }
    }
}