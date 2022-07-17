import { Difficulty } from "@prisma/client"

export interface CreateTourDto{
    name:string
    rating:number
    price:number
    priceDiscount:number
    summary:string
    duration:number
    ratingsAverage ?:number
    ratingsQuantity ?:number
    difficulty:string
    description:string
    imageCover:string
    images:string[]
    maxGroupSize:number
    startDates: string[]
    endDates: string[]
}

export interface ToursDto{
    id:number
    name:string
    rating:number
    price:number
    priceDiscount:number
    summary:string
    duration:number
    ratingsAverage:number
    ratingsQuantity:number
    difficulty:Difficulty
    description:string
    imageCover:string
    images:string[]
    maxGroupSize:number
    startDates: string[]
    endDates: string[]
    createdAt: Date
    updatedAt:Date

}

export interface SearchQueryParams{
   duration?:string,
   page?:number,
   fields?:string[]
   limit?:number
}


/*
  equals?: Int
  in?: List<Int>
  notIn?: List<Int>
  lt?: Int
  lte?: Int
  gt?: Int
  gte?: Int
  not?: Int | NestedIntFilter
*/