import express from "express";
import "reflect-metadata";
import { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import { AppDataSource } from "./config/database.config";
import { errorHandler, notFoundError } from "./middlewares/errorHandler";
dotenv.config();

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
// starts an application

const start = async () => {
  try {
    // connecting to the database
    await AppDataSource.initialize();

    const app: Application = express();
    // const whiteList = ["http://localhost:3005"];
    // logger
    app.use(morgan("dev"));
    app.use(
      cors()
      //   {
      //   origin: (origin, callback) => {
      //     if (whiteList.indexOf(origin as string) !== -1) {
      //       callback(null, true);
      //     } else {
      //       callback(new Error("Not Allowed By CORS"));
      //     }
      //   },
      //   optionsSuccessStatus: 200,
      // }
    );
    app.use(express.json());

    // route handler
    app.use("/api/v1", routes);

    // 404 Error
    app.use(notFoundError);

    // Custom Error Handler
    app.use(errorHandler);

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
      console.log(`🔥🔥 Server is listening on port ${PORT} 🔥🔥🔥`);
    });
  } catch (error) {
    console.log(error);
    console.log("something went wrong");
  }
};

start();
