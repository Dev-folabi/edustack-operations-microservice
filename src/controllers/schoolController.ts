import { NextFunction, Request, Response } from "express";
import { classSchoolRequest } from "../types/request";

export const createClass = async(req: Request<{}, {}, classSchoolRequest>, res: Response, next: NextFunction)=>{
try{
const {label, section, school_id}= req.body


}catch(error: any){
    next(error)
}
}