const { Server } = require("socket.io");
const { drawOne, setDefaultCard, getDefaultCard } = require("./utils/cards");
const { addUser, removeUser, getUsersInRoom, setCurrentPlayerTurn, getCurrentPlayerTurn } = require("./utils/users");

exports.connectToIoServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", ({ name, room }, callback) => {
      try {
        const { user } = addUser({ id: socket.id, name, room });
        if (!user) return { error: "User already exists", code: 400, ok: false };

        socket.join(user.room);

        const usersInRoom = getUsersInRoom(user.room);

        if (usersInRoom.length === 1) {
          setDefaultCard(room);
          const card = getDefaultCard(room);
          socket.emit("draw-first-card", { card: card });
          setCurrentPlayerTurn(user.id, user.room);
          socket.emit("next-player-to-play", getCurrentPlayerTurn(user.room));
        }

        io.to(user.room).emit("roomData", {
          room: user.room,
          users: usersInRoom,
        });
        if (callback) callback();
      } catch (e) {
        console.log(e);
      }
    });

    require("./controllers/cards").handleSocket(socket, io);
    require("./controllers/room").handleSocket(socket, io);

    socket.on("disconnect", () => {
      try {
        const user = removeUser(socket.id);
        if (!user) return;

        const usersInRoom = getUsersInRoom(user.room);
        setCurrentPlayerTurn(usersInRoom[0].id, user.room);
        socket.broadcast.to(user.room).emit("next-player-to-play", getCurrentPlayerTurn(user.room));

        io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUsersInRoom(user.room),
        });
      } catch (error) {
        console.log(error);
      }
    });
  });
};
