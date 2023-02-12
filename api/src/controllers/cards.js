const express = require("express");
const router = express.Router();
const { getRooms, modifyUser, getUser, getUsersInRoom } = require("../utils/users");
const { drawOne, drawMany, getDefaultCard, setDefaultCard, getDirection, setDirection, getStack, setStack } = require("../utils/cards");

router.get("/default/:room", async (req, res) => {
  try {
    const defaultCard = getDefaultCard(req.params.room);
    res.status(200).send({ data: defaultCard, ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: e.message, ok: false });
  }
});

const roomController = (module.exports = router);

roomController.handleSocket = (socket, io) => {
  socket.on("next-turn", () => {
    try {
      const user = getUser(socket.id);
      const usersInRoom = getUsersInRoom(user.room);
      let way;
      if (getDirection(user.room) === "conter-clockwise") {
        way = -1;
      } else {
        way = 1;
      }

      const nextUserIndex = usersInRoom.findIndex((user) => user.id === socket.id) + way;
      const nextUser = usersInRoom[((nextUserIndex % usersInRoom.length) + usersInRoom.length) % usersInRoom.length];

      io.to(user.room).emit("next-player-to-play", nextUser);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("draw-card", () => {
    try {
      const card = drawOne();
      io.to(socket.id).emit("the-card", card);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("draw-cards", (num) => {
    try {
      const cards = drawMany(num);
      io.to(socket.id).emit("the-cards", cards);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("play-card", ({ card }, callback) => {
    try {
      const user = getUser(socket.id);
      socket.broadcast.to(user.room).emit("played-card", { card: card });
      if (card.value === "reverse") {
        if (!getDirection(user.room)) {
          setDirection(user.room, "conter-clockwise");
        } else {
          getDirection(user.room) === "clockwise" ? setDirection(user.room, "conter-clockwise") : setDirection(user.room, "clockwise");
        }
        io.to(user.room).emit("reverse");
      }
      if (card.value === "draw2" || card.value === "draw4") {
        const num = card.value === "draw2" ? 2 : 4;
        if (!getStack(user.room)) setStack(user.room, num);
        else setStack(user.room, getStack(user.room) + num);
        io.to(user.room).emit("draw-multiple", { stack: getStack(user.room) });
      }

      if (callback) callback();
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("reset-stack", () => {
    try {
      const user = getUser(socket.id);
      setStack(user.room, null);
      io.to(user.room).emit("draw-multiple", { stack: null });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("card-numbers", (num) => {
    try {
      const user = getUser(socket.id);
      if (!user) return;
      const usersInRoom = getUsersInRoom(user.room);
      modifyUser(socket.id, "cardsNb", num);
      io.to(user.room).emit("roomData", { users: usersInRoom });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("winner", () => {
    try {
      const user = getUser(socket.id);
      io.to(user.room).emit("player-won", { user: user });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("play-again", (callback) => {
    try {
      const user = getUser(socket.id);
      const usersInRoom = getUsersInRoom(user.room);

      // reset default card
      setDefaultCard(user.room);

      // redraw cards
      usersInRoom.forEach((user) => {
        const cards = drawMany(7);
        io.to(user.id).emit("the-cards", cards);
      });
      callback();
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("get-default-card", () => {
    try {
      const user = getUser(socket.id);
      const defaultCard = getDefaultCard(user.room);
      io.to(user.room).emit("draw-first-card", { card: defaultCard });
    } catch (error) {
      console.log(error);
    }
  });
};
