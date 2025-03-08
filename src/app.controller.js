import connectDB from "./db/connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import companyRouter from "./modules/company/company.controller.js";
import chatRouter from "./modules/chat/chat.controller.js";
import jobRouter from "./modules/job/job.controller.js";
import { globalErrorResHandler, notFoundURL } from "./utils/index.js";
import cors from "cors";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { createHandler } from "graphql-http/lib/use/express";
import { adminSchema } from "./modules/admin/admin.schema.js";
import { roles } from "./constants/roles.js";
import { isAuthorized } from "./middlewares/authorization.middleware.js";
import { isAuthanticated } from "./middlewares/auth.middleware.js";

export const bootstrap = async (app, express) => {
  //parse req body if it was >> raw json
  app.use(express.json());

  app.use(rateLimit({ limit: 20 }));
  app.use(morgan("dev"));
  app.use(cors("*")); //allow access apis
  app.use("/uploads", express.static("uploads"));

  await connectDB();

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/company", companyRouter);
  app.use("/job", jobRouter);
  app.use("/chat", chatRouter);
  app.use(
    "/admin",
    isAuthanticated,
    isAuthorized(roles.ADMIN),
    createHandler({
      schema: adminSchema,
    })
  );

  //handle invalid requests
  app.all("*", notFoundURL);
  //global error middleware
  app.use(globalErrorResHandler);
};
