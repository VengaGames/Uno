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
    socket.on("join", async ({ name: userName, roomName, oldSocketId }, callback) => {
      let room: Room | undefined = await roomService.fetchRoomByName(userName);
      if (!room) {
        return callback({ errorCode: ErrorCodes.CREATE_ROOM_FAILED, code: 500 });
      }

      const user = await userService.addUserInRoom(userName, room.id, socket.id, oldSocketId);
      if (!user) {
        callback({ errorCode: ErrorCodes.USER_ALREADY_EXISTS, code: 400 });
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
      if (callback) {
        callback({ ok: true })
      }
    });

    require("./controllers/cards").handleSocket(socket, io);
    require("./controllers/room").handleSocket(socket, io);

    socket.on("disconnect", () => {
      try {
        const user = removeUser(socket.id);
        if (!user) return;
        socket.leave(user.room);

        const usersInRoom = getUsersInRoom(user.room);
        if (usersInRoom.length === 0) {
          //reset all
          setCurrentCard(user.room, null);
          setCurrentPlayerTurn(null, user.room);
          setStack(user.room, null);
          setDirection(user.room, null);
          return;
        }
        setCurrentPlayerTurn(usersInRoom[0].id, user.room);
        io.to(user.room).emit("next-player-to-play", getCurrentPlayerTurn(user.room));

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
