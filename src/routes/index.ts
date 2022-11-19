import { Request, Response, Router } from "express";
import { auth } from "../middlewares/authHandler";
import productsRouter from "./products";
import userRouter from "./users";
const router = Router();

router.use("/products", productsRouter);
router.use("/users", userRouter);

// test route
router.get("/protected", auth, (req: Request, res: Response) => {
  console.log(req["user"]);
  res.status(200).json({
    sucess: true,
    message: "protected route",
    data: req["user"].email,
  });
});

export default router;
