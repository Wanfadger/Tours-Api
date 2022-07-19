
export interface UserDto{
    id:string
    nam:string 
    emai:string
    photo:string
    role:string
}


export interface CreateUserDto{
    name:string 
    email:string
    photo:string
    password:string
}

export interface LoginDto{
    email:string
    password:string
}

export interface ForgotPasswordDto{
    email:string
}

export interface ResetPasswordDto{
    email:string
    password:string
}