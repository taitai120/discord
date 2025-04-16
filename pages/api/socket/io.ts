import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

import { NextApiResponseServerIo } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      // @ts-ignore
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
      cors: {
        origin: ["http://localhost:3000"], // Explicitly allow the frontend
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true, // Important for handling cookies and authentication
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);
      socket.on("sayhi", (payload, callback) => {
        console.log("sayhi");
        console.log("payload", payload);
        console.log("callback", callback);
      });
      socket.on("disconnect", () =>
        console.log("Client disconnected:", socket.id)
      );
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
