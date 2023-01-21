const express = require("express");
const router = express.Router();
const { getRooms, removeUser, getUser, getUsersInRoom } = require("../utils/users");
const { getSettings, setSettings } = require("../utils/settings");

router.get("/", async (req, res) => {
  try {
    const rooms = getRooms();
    res.status(200).send({ data: rooms, ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: e.message, ok: false });
  }
});

const roomController = (module.exports = router);

roomController.handleSocket = (socket, io) => {
  socket.on("leave-room", () => {
    try {
      const user = removeUser(socket.id);
      const usersInRoom = getUsersInRoom(user.room);

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });

      if (usersInRoom.every((user) => user.videoSelected)) {
        io.to(user.room).emit("all-videos-selected", true);
      }
    } catch (error) {
      console.log(error);
    }
  });
};
