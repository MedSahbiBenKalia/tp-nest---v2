import { Injectable, NestMiddleware } from "@nestjs/common";
import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "../interfaces/request.interface";
// Extend the Request interface to include the 'userId' property


@Injectable()
export class AuthMiddleware implements NestMiddleware {
  
  use(req: RequestWithUser, res: Response, next: NextFunction) {
    const token = req.headers["auth-user"]?.toString();
    console.log('AuthMiddleware triggered for:', req.url);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try
    {
        const decoded = verify(token, process.env.JWT_SECRET || "") as { userId: string };
        req.userId = decoded.userId;
    }
    catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    next();
  }
}