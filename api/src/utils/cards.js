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
  { color: "red", value: "skip" },
  { color: "red", value: "reverse" },
  { color: "red", value: "draw2" },
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
  { color: "blue", value: "skip" },
  { color: "blue", value: "reverse" },
  { color: "blue", value: "draw2" },
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
  { color: "green", value: "skip" },
  { color: "green", value: "reverse" },
  { color: "green", value: "draw2" },
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
  { color: "yellow", value: "skip" },
  { color: "yellow", value: "reverse" },
  { color: "yellow", value: "draw2" },
  //   { color: "black", value: "wild", chance: 4 },
  { color: "black", value: "draw4", chance: 4 },
];

let direction = [];
const stacks = [];
const currentCards = [];

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

function setDirection(room, way) {
  direction = direction.filter((dir) => dir.room !== room);
  direction.push({ room: room, way: way });
}

function getDirection(room) {
  const way = direction.find((dir) => dir.room === room)?.way;
  if (!way) return null;
  return way;
}

function setStack(room, stack) {
  const index = stacks.findIndex((stack) => stack.room === room);
  if (index !== -1) {
    if (stack === null) return stacks.splice(index, 1);
    stacks[index].stack = stack;
  } else {
    stacks.push({ room, stack });
  }
}

function getStack(room) {
  const index = stacks.findIndex((stack) => stack.room === room);
  if (index !== -1) {
    return stacks[index].stack;
  }
  return null;
}

function getCurrentCard(room) {
  const index = currentCards.findIndex((card) => card.room === room);
  if (index !== -1) {
    return currentCards[index];
  } else {
    // if no card is set, set the default card
    const card = drawOne();
    currentCards.push({ room, ...card });
    return card;
  }
}

function setCurrentCard(room, card) {
  const index = currentCards.findIndex((card) => card.room === room);
  if (index !== -1) {
    if (card === null) return currentCards.splice(index, 1);
    currentCards[index] = { room, ...card };
  } else {
    currentCards.push({ room, ...card });
  }
}

module.exports = { drawOne, drawMany, setDirection, getDirection, setStack, getStack, getCurrentCard, setCurrentCard };
