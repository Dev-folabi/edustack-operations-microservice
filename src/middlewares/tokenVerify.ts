import { NextFunction, Request, Response } from "express";
import { getTokenFromHeader } from "../functions/token";
import jwt from "jsonwebtoken";
import { handleError } from "../error/errorHandler";

const JTWSign = `${process.env.JWT_SECRET_KEY}`;

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = getTokenFromHeader(req);

    jwt.verify(token, JTWSign, (err) => {
      if (err) {
        return handleError(res, "Invalid token provided, pls login", 400);
      } else {
        next();
      }
    });
  } catch (error: any) {
    console.error("Error in verifyToken:", error.message);
    next(error);
  }
};
