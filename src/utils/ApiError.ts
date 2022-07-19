export class ApiError extends Error {
    isOperational = false;
    constructor(public message: string , private statusCode?: number) {
        super(message);
        this.statusCode = this.statusCode || 500; 
        this.isOperational = true
    }

}
