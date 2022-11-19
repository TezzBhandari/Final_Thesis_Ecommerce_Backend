import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { refreshTokenHandler } from "../../controllers/refreshToken_op";
import { loginUser, logoutUser, registerUser } from "../../controllers/user_op";
import { auth } from "../../middlewares/authHandler";

const router = Router();

// register route with validation middlewares
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

// login route with validation middleware
router.post(
  "/login",
  body("email")
    .not()
    .isEmpty()
    .withMessage("email field cannot be empty")
    .isEmail()
    .withMessage("invalid email")
    .normalizeEmail()
    .withMessage("invalid email"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("password field cannot be empty"),
  loginUser
);

// logout route
router.post("/logout", auth, logoutUser);

router.get("/token/refresh", refreshTokenHandler);

export default router;
