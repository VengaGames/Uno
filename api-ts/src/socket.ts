import { Server } from "socket.io";
import type { ServerType } from '@hono/node-server';
import RoomService from './services/RoomService';
import type { Room } from './types/databaseType';
import { ErrorCodeEnum } from './types/types';
import UserService from './services/UserService';
import jwt from 'jsonwebtoken';
import { SECRET } from './config';

const signToken = (id: number, name: string, roomId: number) => {
  return jwt.sign({ id, name, permissions: [] }, SECRET, { expiresIn: '30d' });
};

export default function connectToIoServer(server: ServerType) {
  const roomService: RoomService = RoomService.instance;
  const userService: UserService = UserService.instance;

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", async ({ name: userName, roomName, oldSocketId }, onError) => {
      let room: Room | undefined = await roomService.fetchRoomByName(roomName);
      if (!room) {
        return onError({ errorCode: ErrorCodeEnum.CREATE_ROOM_FAILED, code: 500 });
      }

      const user = await userService.addUserInRoom(userName, room.id, socket.id, oldSocketId);
      if (!user) {
        onError({ errorCode: ErrorCodeEnum.USER_ALREADY_EXISTS, code: 400 });
        return;
      }

      socket.join(room.name);

      // fresh new room
      if (!room.creatorId) {
        room = await roomService.initiateRoom(room.id, user.id);
      }

      io.to(room.name).emit("roomData", {
        room: room,
        users: await userService.fetchUsersByRoomId(room.id),
      });

      io.to(socket.id).emit("deck", { cards: user.cards });

      const token = signToken(user.id, user.userName, room.id);
      io.to(socket.id).emit("webSessionToken", { webSessionToken: token });
    });

    require("./controllers/cards").handleSocket(socket, io);
    require("./controllers/room").handleSocket(socket, io);

    socket.on("disconnect", async () => {
      const user = await userService.deleteUserBySocketId(socket.id);
      if (!user) {
        return;
      }
      const room = await roomService.fetchRoomById(user.roomId);
      if (!room) {
        return;
      }

      socket.leave(room.name);

      const usersInRoom = await userService.fetchUsersByRoomId(room.id);
      if (usersInRoom.length === 0) {
        // room is empty, delete it
        await roomService.deleteRoomById(room.id);
        return;
      }

      if (room.currentTurnUserId === user.id) {
        // Change the turn to the next player
        const nextPlayerId = await roomService.incrementAndGetNextPlayerTurn(room.id);

        io.to(room.name).emit("next-player-to-play", nextPlayerId);
      }

      io.to(room.name).emit("roomData", {
        room: room,
        users: usersInRoom,
      });
    });

    socket.on("error", (error) => {
      console.error(error);
    });
  });
};
