import { NextFunction, Request, Response } from "express";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../config/database.config";
import { User } from "../entities/User";

// export interface CustomRequest extends Request {
//   token: string | JwtPayload;
// }

const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const verifiedUser = {};
    const cookies = req.cookies;
    if (!cookies?.refresh_token) {
      return res.sendStatus(401);
    }
    const refreshToken = cookies.refresh_token;

    const foundUser = await AppDataSource.getRepository(User).findOneBy({
      refresh_token: refreshToken,
    });

    if (!foundUser) {
      return res.sendStatus(403); //Forbidden
    } else {
      const verification = jsonwebtoken.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      verifiedUser["user"] = verification;

      //   (req as CustomRequest).token = verifiedUser;
      if (foundUser.email !== verifiedUser["user"].email) {
        return res.sendStatus(403); // Forbidden user
      } else {
        const payload = {
          username: verifiedUser["user"].username,
          email: verifiedUser["user"].email,
          userId: verifiedUser["user"].id,
          iss: "ecommerce_backend",
          iat: Date.now(),
          exp: Math.floor(Date.now() / 1000) + 60,
        };
        const accessToken = jsonwebtoken.sign(
          payload,
          process.env.ACCESS_TOKEN_SECRET
        );
        res.status(200).json({
          success: true,
          accessToken,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.sendStatus(401);
  }
};

export { refreshTokenHandler };
