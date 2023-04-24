const express = require("express");
const router = express.Router();
const { getRooms, modifyUser, getUser, getUsersInRoom, getCurrentPlayerTurn, setCurrentPlayerTurn } = require("../utils/users");
const { drawOne, drawMany, getDirection, setDirection, getStack, setStack, getCurrentCard, setCurrentCard } = require("../utils/cards");

router.get("/default/:room", async (req, res) => {
  try {
    const defaultCard = getCurrentCard(req.params.room);
    res.status(200).send({ data: defaultCard, ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: e.message, ok: false });
  }
});

const isThePlayerTurn = (user) => {
  if (!user) return { error: "User not found", ok: false };
  const userToPlay = getCurrentPlayerTurn(user.room);
  if (!userToPlay) return { error: "User not found", ok: false };
  if (userToPlay.id !== user.id) return { error: "Ce n'est pas votre tour !", ok: false };
  const users = getUsersInRoom(user.room);
  if (users.length === 1) return { error: "Vous êtes seul dans la partie !", ok: false };

  return { ok: true };
};

const verifyCard = (card, user) => {
  const stack = getStack(user.room);
  const actualCard = getCurrentCard(user.room);
  if (stack) {
    if (card.value !== "draw4" && actualCard.value === "draw4") return { error: "Vous devez jouer une carte +4", ok: false };
    if (!["draw2", "draw4"].includes(card.value)) return { ok: false, error: "Vous devez jouer une carte +2 ou +4" };
    return { ok: true };
  } else {
    if (card.color === "black" || ["draw4", "wild"].includes(card?.value)) return { ok: true };
    if (card.color === actualCard.color || card.value === actualCard.value) return { ok: true };
  }
  return { ok: false, error: "Vous ne pouvez pas jouer cette carte" };
};

const goToNextPlayer = (user, io, skipPlayer = false) => {
  const usersInRoom = getUsersInRoom(user.room);
  let way;
  if (getDirection(user.room) === "conter-clockwise") {
    way = skipPlayer ? -2 : -1;
  } else {
    way = skipPlayer ? 2 : 1;
  }

  const nextUserIndex = usersInRoom.findIndex((u) => u.id === user.id) + way;
  const nextUser = usersInRoom[((nextUserIndex % usersInRoom.length) + usersInRoom.length) % usersInRoom.length];

  setCurrentPlayerTurn(nextUser.id, user.room);

  io.to(user.room).emit("next-player-to-play", nextUser);
};

const roomController = (module.exports = router);

roomController.handleSocket = (socket, io) => {
  socket.on("next-turn", () => {
    try {
      const user = getUser(socket.id);
      goToNextPlayer(user, io);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("draw-card", (callback) => {
    try {
      const user = getUser(socket.id);
      // check if the user is the current player
      const turnVerify = isThePlayerTurn(user);
      if (!turnVerify.ok) return callback(turnVerify);

      // else, draw the number of cards in the stack, if there is one
      const stack = getStack(user.room);
      if (stack) {
        const cards = drawMany(stack);
        setStack(user.room, null);
        io.to(user.room).emit("draw-multiple", { stack: null });
        if (callback) callback({ ok: true });
        io.to(socket.id).emit("the-cards", cards);
      } else {
        const card = drawOne();
        if (callback) callback({ ok: true });
        io.to(socket.id).emit("the-card", card);
      }
      // go to the next player
      goToNextPlayer(user, io);
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
      // verify if it's the user turn
      const turnVerify = isThePlayerTurn(user);
      if (!turnVerify.ok) return callback(turnVerify);

      // verify if the card is valid
      const cardVerify = verifyCard(card, user);
      if (!cardVerify.ok) return callback(cardVerify);

      // else, play the card
      setCurrentCard(user.room, card);
      io.to(user.room).emit("played-card", { card: card });
      if (card.value === "reverse") {
        if (!getDirection(user.room)) {
          setDirection(user.room, "conter-clockwise");
        } else {
          getDirection(user.room) === "clockwise" ? setDirection(user.room, "conter-clockwise") : setDirection(user.room, "clockwise");
        }
        io.to(user.room).emit("reverse", { direction: getDirection(user.room) });
      }
      if (card.value === "draw2" || card.value === "draw4") {
        const num = card.value === "draw2" ? 2 : 4;
        if (!getStack(user.room)) setStack(user.room, num);
        else setStack(user.room, getStack(user.room) + num);
        io.to(user.room).emit("draw-multiple", { stack: getStack(user.room) });
      }

      // go to the next player
      const skipPlayer = card.value === "skip";
      goToNextPlayer(user, io, skipPlayer);

      if (callback) callback({ ok: true });
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
      setCurrentCard(user.room, null);

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
      const defaultCard = getCurrentCard(user.room);
      io.to(user.room).emit("draw-first-card", { card: defaultCard });
    } catch (error) {
      console.log(error);
    }
  });
};
