import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("New user connected:", socket.id);

      socket.on("join", (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-joined", socket.id);
      });

      socket.on("offer", (data) => {
        socket.to(data.target).emit("offer", {
          sender: socket.id,
          sdp: data.sdp,
        });
      });

      socket.on("answer", (data) => {
        socket.to(data.target).emit("answer", {
          sender: socket.id,
          sdp: data.sdp,
        });
      });

      socket.on("ice-candidate", (data) => {
        socket.to(data.target).emit("ice-candidate", {
          sender: socket.id,
          candidate: data.candidate,
        });
      });

      socket.on("disconnect", () => {
        socket.broadcast.emit("user-left", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
