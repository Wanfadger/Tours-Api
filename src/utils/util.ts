export const selectPrismaFields = (...fields:string[]):{[key: string]: true} => {
    const obj:{[key: string]: true}  = {}
    fields.forEach(element => {
       obj[element] = true;
    });
    return obj
}