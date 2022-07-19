export interface LoginDto{
    email:string
    password:string
}

export interface ForgotPasswordDto{
    email:string
}

export interface ResetPasswordDto{
    password:string
}

export interface UpdatePasswordDto{
    password:string
    newPassword:string
}


export interface Email{
    to:string
    from:string
    subject:string
    message:string
}