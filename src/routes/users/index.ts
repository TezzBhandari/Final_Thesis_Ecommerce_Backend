import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { registerUser } from "../../controllers/user_op";

const router = Router();

// creates users route with validation middlewares
router.post(
  "/register",
  body("customerFirstName")
    .not()
    .isEmpty()
    .withMessage("First name field cannot be empty"),
  body("customerLastName")
    .not()
    .isEmpty()
    .withMessage("Last name field cannot be empty"),
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email field cannot be empty")
    .isEmail()
    .withMessage("invalid email")
    .normalizeEmail()
    .withMessage("invalid email"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("password cannot be empty")
    .isLength({ min: 6 })
    .withMessage("password cannot be less than 6 character"),
  body("passwordCheck")
    .not()
    .isEmpty()
    .withMessage("password cannot be empty")
    .isLength({ min: 6 })
    .withMessage("password cannot be less than 6 character"),
  registerUser
);

export default router;
