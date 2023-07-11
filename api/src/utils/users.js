const { drawMany } = require("./cards");

const users = [];
const leftUsers = [];
let currentPlayer = [];

function addUser({ id, name, room, oldId }) {
  if (oldId) {
    const oldUserIndex = leftUsers.findIndex((user) => user.id === oldId && user.room === room);
    if (oldUserIndex !== -1) {
      const oldUser = leftUsers.splice(oldUserIndex, 1)[0];
      oldUser.id = id;
      users.push(oldUser);
      return { user: oldUser };
    }
  }

  name = name?.trim();
  room = room?.trim();

  if (!name || !room) return { error: "Username and room are required" };

  const existingUser = users.find((user) => user.room === room && user.name === name);
  if (existingUser) return { error: "User is taken" };

  const defaultDeck = drawMany(7);

  const user = { id, name, room, cards: defaultDeck };
  users.push(user);

  return { user };
}

function getRooms() {
  let rooms = users.map((user) => user.room);
  rooms = [...new Set(rooms)];

  const usersNbInRooms = rooms.map((room) => getUsersInRoom(room)).map((users) => users.length);
  return rooms.map((room, index) => ({ name: room, usersNb: usersNbInRooms[index] }));
}

function removeUser(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    const user = users.splice(index, 1)[0];
    leftUsers.push(user);
    return user;
  }
}

function modifyUser(id, key, value) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    users[index][key] = value;
  }
}

function getUser(id) {
  return users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  return users.filter((user) => user.room === room);
}

function setCurrentPlayerTurn(userId, room) {
  currentPlayer = currentPlayer.filter((player) => player.room !== room);
  currentPlayer.push({ room: room, id: userId });
}

function getCurrentPlayerTurn(room) {
  const id = currentPlayer.find((player) => player.room === room)?.id;
  if (!id) return null;
  return getUser(id);
}

module.exports = { addUser, modifyUser, removeUser, getUser, getUsersInRoom, getRooms, setCurrentPlayerTurn, getCurrentPlayerTurn };
