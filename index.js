import express from "express";
import { bootstrap } from "./src/app.controller.js";
import { Server } from "socket.io";
import { initializeSocket } from "./src/socket.controller.js";

const app = express();

bootstrap(app, express);

const server = app.listen(process.env.PORT || 3001, () => {
  console.log("server is running on port", process.env.PORT || 3001);
});

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173/",
    credentials: true,
    methods: ["POST", "GET"],
  },
}); //setup socket.io connection (cors to allow connection between sokets in fe and be origin is the fe url but for dev let it be *)

initializeSocket(io);
