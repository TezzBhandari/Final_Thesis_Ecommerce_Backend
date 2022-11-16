import { Router } from "express";
import productsRouter from "./products";
import userRouter from "./users";
const router = Router();

router.use("/products", productsRouter);
router.use("/users", userRouter);

export default router;
