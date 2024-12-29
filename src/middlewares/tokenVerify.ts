import { NextFunction, Request, Response } from "express";
import { getTokenFromHeader } from "../functions/token";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return handleError(res, 400, "Authorization header is missing");
    }

    const token = getTokenFromHeader(req);
    if (!token) {
      return handleError(res, 400, "Invalid token provided");
    }

    next();
  } catch (error: any) {
    console.error("Error in verifyToken:", error.message);
    next(error);
  }
};

const handleError = (res: Response, status: number, message: string) => {
  res.status(status).json({ success: false, message });
};
