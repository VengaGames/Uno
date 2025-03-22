import { type DefaultEventsMap, Server, Socket } from "socket.io";
import type { ServerType } from '@hono/node-server';
import RoomService from './services/RoomService';
import type { Room, User } from './types/databaseType';
import { ErrorCodes } from './types/types';
import UserService from './services/UserService';

export default function connectToIoServer(server: ServerType) {
  const roomService: RoomService = RoomService.instance;
  const userService: UserService = UserService.instance;

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    socket.on("join", async ({ name: userName, roomName, oldSocketId }, onError) => {
      let room: Room | undefined = await roomService.fetchRoomByName(userName);
      if (!room) {
        return onError({ errorCode: ErrorCodes.CREATE_ROOM_FAILED, code: 500 });
      }

      const user = await userService.addUserInRoom(userName, room.id, socket.id, oldSocketId);
      if (!user) {
        onError({ errorCode: ErrorCodes.USER_ALREADY_EXISTS, code: 400 });
        return;
      }

      socket.join(room.name);

      const usersInRoom: User[] = await userService.fetchUsersByRoomId(room.id);

      // fresh new room
      if (!room.creatorId) {
        const updatedRoom = await roomService.initiateRoom(room.id, user.id);
        if (updatedRoom) {
          room = updatedRoom;
        } else {
          // TODO: Handle this error
          throw new Error(`Room ${room.name} not found`);
        }
      }

      io.to(room.name).emit("roomData", {
        room: room,
        users: usersInRoom,
      });

      io.to(socket.id).emit("deck", { cards: user.cards });
    });

    require("./controllers/cards").handleSocket(socket, io);
    require("./controllers/room").handleSocket(socket, io);

    socket.on("disconnect", async (reason, description) => {
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
