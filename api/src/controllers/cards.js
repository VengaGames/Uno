const express = require("express");
const router = express.Router();
const { getRooms, modifyUser, getUser, getUsersInRoom } = require("../utils/users");
const { drawOne, drawMany, getDefaultCard } = require("../utils/cards");

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

      const nextUserIndex = usersInRoom.findIndex((user) => user.id === socket.id) + 1;
      const nextUser = usersInRoom[nextUserIndex % usersInRoom.length];

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
  socket.on("play-card", (card) => {
    try {
      const user = getUser(socket.id);
      socket.broadcast.to(user.room).emit("played-card", { card: card });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("card-numbers", (num) => {
    try {
      const user = getUser(socket.id);
      const usersInRoom = getUsersInRoom(user.room);
      modifyUser(socket.id, "cardsNb", num);
      io.to(user.room).emit("roomData", { users: usersInRoom });
    } catch (error) {
      console.log(error);
    }
  });
};
