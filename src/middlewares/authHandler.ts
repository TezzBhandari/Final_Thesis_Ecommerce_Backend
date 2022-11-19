import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import createError from "http-errors";

// issuing jwt token

import { User } from "../entities/User";
import { NextFunction, Request, Response } from "express";

dotenv.config();

const issueJwt = (user: User) => {
  try {
    const access_token_payload = {
      username: user.first_name + " " + user.last_name,
      email: user.email,
      userId: user.id,
      iss: "ecommerce_backend",
      iat: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 30,
    };

    const refresh_token_payload = {
      username: user.first_name + " " + user.last_name,
      email: user.email,
      userId: user.id,
      iss: "ecommerce_backend",
      iat: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    const accessToken = jsonwebtoken.sign(
      access_token_payload,
      process.env.ACCESS_TOKEN_SECRET
    );

    const refreshToken = jsonwebtoken.sign(
      refresh_token_payload,
      process.env.REFRESH_TOKEN_SECRET
    );
    return {
      accessToken,
      refreshToken,
    };
  } catch (err) {
    console.log(err);
  }
};

// verifying jwt
const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // if (!req.cookies || !req.cookies.access_token) {
    //     return next(createError(401, 'you are not authorized'))
    // }
    // const tokenParts = req.cookies.access_token.split(' ')

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      next(createError(401, "you are not authorized"));
    }
    const tokenParts = authHeader.split(" ");

    if (
      tokenParts[0] === "Bearer" &&
      tokenParts[1].match(/\S+\.\S+\.\S+/) !== null
    ) {
      const verification = jsonwebtoken.verify(
        tokenParts[1],
        process.env.ACCESS_TOKEN_SECRET
      );
      req["user"] = verification;

      next();
    } else {
      next(createError(401, "you are not authorized"));
    }
  } catch (err) {
    console.log(err.message, err);

    if (err.message === "jwt expired") {
      next(createError(401, `JWT Token Expired. Login Again`));
    } else {
      next(createError(403, `authentication invalid`)); // invalid token
    }
  }
};

export { issueJwt, auth };
