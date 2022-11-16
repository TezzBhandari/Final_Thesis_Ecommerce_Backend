import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppDataSource } from "../config/database.config";
import { User } from "../entities/User";
import { hashPassword } from "../utils/crypto";

// creates user

const registerUser = async (req: Request, res: Response) => {
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
      errors: {
        success: false,
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
      errors: {
        success: false,
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
};

export { registerUser };
