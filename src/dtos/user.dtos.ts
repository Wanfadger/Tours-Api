
export interface UserDto{
    id:string
    name:string 
    email:string
    photo:string
    role:string
}


export interface CreateUserDto{
    name:string 
    email:string
    photo:string
    password:string
}


export interface UpdateUserDto{
    name:string 
    photo:string
}



