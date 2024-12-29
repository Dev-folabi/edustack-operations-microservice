import { Request } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
}
const JWT = process.env.JWT_SECRET_KEY as string;

export const decodeToken = (token: string): string => {
  try {
    const decoded = jwt.verify(token, JWT) as TokenPayload;
    return decoded.id;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const getIdFromHeader = (req: Request) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new Error("Invalid authorization header format");
    }

    const token = parts[1];
    const decoded = jwt.verify(token, JWT) as TokenPayload;
    return decoded.id;
  } catch (error: any) {
    throw new Error(`Invalid token sent`);
  }
};

export const getTokenFromHeader = (req: Request) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return "";
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      return "";
    }

    return token;
  } catch (error: any) {
    throw new Error(`Invalid token sent`);
  }
};
