const { v4: uuidv4 } = require("uuid");
// array of all the uno cards in the deck
const cards = [
  { color: "red", value: 0 },
  { color: "red", value: 1 },
  { color: "red", value: 2 },
  { color: "red", value: 3 },
  { color: "red", value: 4 },
  { color: "red", value: 5 },
  { color: "red", value: 6 },
  { color: "red", value: 7 },
  { color: "red", value: 8 },
  { color: "red", value: 9 },
  { color: "red", value: 1 },
  { color: "red", value: 2 },
  { color: "red", value: 3 },
  { color: "red", value: 4 },
  { color: "red", value: 5 },
  { color: "red", value: 6 },
  { color: "red", value: 7 },
  { color: "red", value: 8 },
  { color: "red", value: 9 },
  //   { color: "red", value: "skip" },
  //   { color: "red", value: "reverse" },
  //   { color: "red", value: "draw2" },
  { color: "blue", value: 0 },
  { color: "blue", value: 1 },
  { color: "blue", value: 2 },
  { color: "blue", value: 3 },
  { color: "blue", value: 4 },
  { color: "blue", value: 5 },
  { color: "blue", value: 6 },
  { color: "blue", value: 7 },
  { color: "blue", value: 8 },
  { color: "blue", value: 9 },
  { color: "blue", value: 1 },
  { color: "blue", value: 2 },
  { color: "blue", value: 3 },
  { color: "blue", value: 4 },
  { color: "blue", value: 5 },
  { color: "blue", value: 6 },
  { color: "blue", value: 7 },
  { color: "blue", value: 8 },
  { color: "blue", value: 9 },
  //   { color: "blue", value: "skip" },
  //   { color: "blue", value: "reverse" },
  //   { color: "blue", value: "draw2" },
  { color: "green", value: 0 },
  { color: "green", value: 1 },
  { color: "green", value: 2 },
  { color: "green", value: 3 },
  { color: "green", value: 4 },
  { color: "green", value: 5 },
  { color: "green", value: 6 },
  { color: "green", value: 7 },
  { color: "green", value: 8 },
  { color: "green", value: 9 },
  { color: "green", value: 1 },
  { color: "green", value: 2 },
  { color: "green", value: 3 },
  { color: "green", value: 4 },
  { color: "green", value: 5 },
  { color: "green", value: 6 },
  { color: "green", value: 7 },
  { color: "green", value: 8 },
  { color: "green", value: 9 },
  //   { color: "green", value: "skip" },
  //   { color: "green", value: "reverse" },
  //   { color: "green", value: "draw2" },
  { color: "yellow", value: 0 },
  { color: "yellow", value: 1 },
  { color: "yellow", value: 2 },
  { color: "yellow", value: 3 },
  { color: "yellow", value: 4 },
  { color: "yellow", value: 5 },
  { color: "yellow", value: 6 },
  { color: "yellow", value: 7 },
  { color: "yellow", value: 8 },
  { color: "yellow", value: 9 },
  { color: "yellow", value: 1 },
  { color: "yellow", value: 2 },
  { color: "yellow", value: 3 },
  { color: "yellow", value: 4 },
  { color: "yellow", value: 5 },
  { color: "yellow", value: 6 },
  { color: "yellow", value: 7 },
  { color: "yellow", value: 8 },
  { color: "yellow", value: 9 },
  //   { color: "yellow", value: "skip" },
  //   { color: "yellow", value: "reverse" },
  //   { color: "yellow", value: "draw2" },
  //   { color: "black", value: "wild", chance: 4 },
  //   { color: "black", value: "draw4", chance: 4 },
];

let defaultCard = [];

// function to draw a card from the deck
const drawOne = () => {
  const card = cards[Math.floor(Math.random() * cards.length)];
  return { ...card, id: uuidv4() };
};

const drawMany = (num) => {
  const cards = [];
  for (let i = 0; i < num; i++) {
    cards.push({ ...drawOne(), id: uuidv4() });
  }
  return cards;
};

const setDefaultCard = (card, room) => {
  defaultCard.push({ ...card, id: uuidv4(), room: room });
  return defaultCard;
};

const getDefaultCard = (room) => {
  return defaultCard.find((card) => card.room === room);
};

module.exports = { drawOne, drawMany, setDefaultCard, getDefaultCard };
