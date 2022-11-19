import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createError from "http-errors";
import { AppDataSource } from "../config/database.config";
import { User } from "../entities/User";
import { issueJwt } from "../middlewares/authHandler";
import { compareHashPassword, hashPassword } from "../utils/crypto";

// creates user

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: {
          type: "FIELD ERROR",
          err: errors.array(),
        },
      });
    }

    const {
      customerFirstName,
      customerLastName,
      email,
      phoneNumber,
      password,
      passwordCheck,
    } = req.body;
    if (password !== passwordCheck) {
      return res.status(400).json({
        success: false,
        errors: {
          type: "Field Error",
          err: [
            {
              msg: "password and re-enter password does not match",
              param: "passwordCheck",
              location: "body",
            },
          ],
        },
      });
    }
    const foundUser = await AppDataSource.getRepository(User).findOneBy({
      email: email,
    });

    if (foundUser) {
      return res.status(400).json({
        success: false,
        errors: {
          type: "USER ERROR",
          err: [
            {
              msg: "user already exists",
              param: "email",
              location: "body",
            },
          ],
        },
      });
    } else {
      const hashedPassword = hashPassword(password);
      const user = new User();
      user.email = email;
      user.first_name = customerFirstName;
      user.last_name = customerLastName;
      user.password = hashedPassword;
      user.phone_number = phoneNumber;
      const newUser = await AppDataSource.getRepository(User).save(user);
      res.status(201).json({
        success: true,
        user: newUser,
        message: "Sucessfully Registered",
      });
    }
  } catch (err) {
    console.log(err);
    next(createError(500, "Server Error! Please Try Again"));
  }
};

// user login handler
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: {
          type: "FIELD ERROR",
          err: errors.array(),
        },
      });
    }

    const { email, password } = req.body;

    const foundUser = await AppDataSource.getRepository(User).findOneBy({
      email: email,
    });

    if (!foundUser) {
      return res.status(400).json({
        success: false,
        errors: {
          type: "USER ERROR",
          err: [
            {
              msg: "user doesn't exist",
              param: "email",
              location: "body",
            },
          ],
        },
      });
    } else {
      const match = compareHashPassword(password, foundUser.password);
      if (!match) {
        return res.status(400).json({
          success: false,
          errors: {
            type: "USER ERROR",
            err: [
              {
                msg: "wrong passsword",
                param: "password",
                location: "body",
              },
            ],
          },
        });
      } else {
        // issuing jwt token
        const { accessToken, refreshToken } = issueJwt(foundUser);

        // saving the refresh token in db for logout functionality
        await AppDataSource.createQueryBuilder()
          .update(User)
          .set({ refresh_token: refreshToken })
          .where("id = :id", { id: foundUser.id })
          .execute();

        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
          sucess: true,
          isAuthenticated: true,
          message: "successfully logged in",
          user: {
            name: foundUser.first_name + " " + foundUser.last_name,
            email: foundUser.email,
            accessToken,
          },
        });
      }
    }
  } catch (err) {
    console.log(err);
    next(createError(500, "Server Error! Please Try Again"));
  }
};

const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refresh_token) {
      return res.sendStatus(204);
    }
    const refreshToken = cookies.refresh_token;

    const foundUser = await AppDataSource.getRepository(User).findOneBy({
      refresh_token: refreshToken,
    });
    if (!foundUser) {
      res.clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.sendStatus(204);
    } else {
      await AppDataSource.createQueryBuilder()
        .update(User)
        .set({ refresh_token: null })
        .where("refresh_token = :refreshToken", { refreshToken: refreshToken })
        .execute();
      res.clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.sendStatus(204);
    }
  } catch (err) {
    console.log(err);
    next(createError(500, "server error. Try again"));
  }
};
export { registerUser, loginUser, logoutUser };
