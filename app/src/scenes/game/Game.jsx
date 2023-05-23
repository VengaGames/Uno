/* eslint-disable indent */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../../service/api";
import useSocket from "../../hooks/socket";
import toast from "react-hot-toast";
import { HiArrowLeft } from "react-icons/hi";
import { RiLoader2Fill, RiForbid2Line } from "react-icons/ri";
import { WiDirectionUp } from "react-icons/wi";
import { FaExchangeAlt } from "react-icons/fa";
import { IoIosColorFilter } from "react-icons/io";
import AskForColor from "../../components/AskForColor";
import { VITE_ENV } from "../../config";
import vengaicon from "../asset/vengaicon.jpeg";

const Login = () => {
  const query = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const roomData = {
    name: query.get("name"),
    room: query.get("room"),
  };
  const [deck, setDeck] = useState([]);
  const [actualCard, setActualCard] = useState(null);
  const [gameInfo, setGameInfo] = useState({ direction: "clockwise" });
  const [color, setColor] = useState(null);

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    // initUser
    const { name, room } = roomData;
    socket.emit("join", { name, room }, (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return navigate("/");
      }
      getDefaultCard(room);
      getCurrentPlayer(room);
    });
    socket.on("roomData", ({ users }) => setUsers([...users]));
    socket.on("deck", async ({ cards, wait }) => {
      if (wait === true) await new Promise((resolve) => setTimeout(resolve, 500));
      setDeck([...cards]);
    });

    socket.on("draw-first-card", ({ card }) => setActualCard(card));
    socket.on("played-card", ({ card, vole, user }) => {
      setActualCard(card);
      // if vole is true, play an animation to show users that he played a la volé
      if (vole === true) {
        const vole = document.createElement("div");
        vole.innerHTML = `<div class="subtitle">${user.name} a joué à la volée !</div>`;
        const positions = {
          x: ["left-1/2", "left-1/3", "left-2/3", "left-1/4", "left-3/4"],
          y: ["top-1/2", "top-1/3", "top-2/3", "top-1/4", "top-3/4"],
        };
        const translations = {
          x: ["-translate-x-1/2", "translate-x-1/2"],
          y: ["-translate-y-1/2", "translate-y-1/2"],
        };
        const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

        const randomX = getRandomItem(positions.x);
        const randomY = getRandomItem(positions.y);
        const randomTranslateX = getRandomItem(translations.x);
        const randomTranslateY = getRandomItem(translations.y);
        vole.classList.add("absolute", "w-fit", "h-10", "animate-[spin_1.5s_linear]", randomX, randomY, randomTranslateX, randomTranslateY, "z-50", "transform");
        document.getElementById("game").appendChild(vole);

        setTimeout(() => {
          vole.remove();
        }, 1500);
      }
    });

    socket.on("next-player-to-play", (user) => setGameInfo((prev) => ({ ...prev, playerToPlay: user })));
    socket.on("reverse", ({ direction }) => setGameInfo((prev) => ({ ...prev, direction: direction })));
    socket.on("set-stack", ({ stack }) => setGameInfo((prev) => ({ ...prev, stack: stack })));
    socket.on("uno", ({ user }) => setGameInfo((prev) => ({ ...prev, uno: user })));
    socket.on("uno-clicked", () => setGameInfo((prev) => ({ ...prev, uno: null })));

    socket.on("player-left", () => getCurrentPlayer(room));

    socket.on("player-won", ({ user }) => alert(`${user.name} a gagné !`));

    if (VITE_ENV !== "development")
      window.onbeforeunload = function () {
        return "Data will be lost if you leave the page, are you sure?";
      };

    return () => socket.emit("leave-room");
  }, [isConnected]);

  const getDefaultCard = async (room) => {
    const { data } = await API.get(`/cards/default/${room}`);
    setActualCard(data);
  };

  const getCurrentPlayer = async (room) => {
    const { data } = await API.get(`/room/current/${room}`);
    setGameInfo((prev) => ({ ...prev, playerToPlay: data }));
  };

  const playCard = async (card, event) => {
    socket.emit("play-card", { card }, (res) => {
      if (!res.ok) return toast.error(res.error);
      if (event) {
        const finalPosition = document.getElementById("actualCard").getBoundingClientRect();
        const finalX = finalPosition.left;
        const finalY = finalPosition.top;

        const rect = event.target.getBoundingClientRect();
        const startX = rect.left;
        const startY = rect.top;

        const translateX = finalX - startX - 10;
        const translateY = finalY - startY - 20;

        event.target.style.transform = "translate(" + translateX + "px, " + translateY + "px)";
        event.target.style.transition = "transform 0.5s ease-in-out";
      }
    });
  };

  const drawCard = () => {
    socket.emit("draw-card", (res) => {
      if (!res.ok) return toast.error(res.error);
    });
  };

  const renderUnoButton = () => {
    // spawn a button to emit uno on a random position
    // generate a random boolean to choose between left or right
    const randomSide = Math.random() >= 1;
    const middleGameSize = window.innerWidth / 4;
    const randomX = randomSide
      ? Math.floor(Math.random() * (window.innerWidth / 2 - middleGameSize))
      : Math.floor(Math.random() * (window.innerWidth / 2 - middleGameSize)) + window.innerWidth / 2 - 35 + middleGameSize;
    const randomY = Math.floor(Math.random() * (window.innerHeight - 50));

    // take a random letter in the alphabet
    const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    // if the user press the key of the letter, emit uno
    document.addEventListener("keydown", (e) => {
      if (e.key.toUpperCase() === randomLetter) {
        socket.emit("uno-click", { unoUser: gameInfo.uno });
      }
    });
    return (
      <div className="absolute text-xl border rounded border-white uppercase text-white p-2" style={{ top: randomY, left: randomX }}>
        {randomLetter}
      </div>
    );
  };

  if (!isConnected || !socket) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="text-white">Connexion en cours...</div>
        <RiLoader2Fill className="animate-spin text-7xl text-white" />
      </div>
    );
  }

  return (
    <Wrapper roomData={roomData} users={users} info={gameInfo}>
      <div className={`${isModalOpen ? "block" : "hidden"}`}>
        <AskForColor setColor={setColor} onclose={() => setIsOpen(false)} />
      </div>
      <div className={`${isModalOpen ? "pointer-events-none" : "block"} flex items-center flex-col mt-3`}>
        <div className="flex gap-6">
          {gameInfo.stack && <div className="text-2xl">Stack : +{gameInfo.stack}</div>}
          {actualCard && <Card card={actualCard} classId="actualCard" />}
          <Card card={{ color: "grey", value: "Pioche" }} type="pioche" onClick={() => drawCard()} />
        </div>
        {deck.length === 0 && (
          <div onClick={() => socket.emit("play-again")} className="flex mt-24 text-2xl border rounded border-white text-white p-5 cursor-pointer">
            Rejouer ?
          </div>
        )}
        {gameInfo?.uno && renderUnoButton()}
        <div className="flex max-w-xl mt-24 flex-wrap flex-row gap-2">
          {deck.map((card) => (
            <Card type="card" onClick={playCard} key={card.id} card={card} setIsOpen={setIsOpen} color={color} setColor={setColor} />
          ))}
        </div>
      </div>
    </Wrapper>
  );
};

const ConnectedPlayers = ({ players, info }) => {
  return (
    <div className="flex flex-col h-fit p-3 bg-[#FDFDFD] rounded-lg items-center">
      <div className="mb-2 text-black font-semibold ">Joueurs</div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-2 justify-center items-start">
          {players.map((player) => (
            <div key={player.id} className="flex gap-2 justify-end items-center">
              {player.id === info?.playerToPlay?.id ? <WiDirectionUp className="text-red-500 rotate-90 text-xl" /> : <WiDirectionUp className="opacity-0 text-xl" />}
              <div className={`${player.id === info?.playerToPlay?.id ? "text-green-500" : "text-black"}`}>{player.name}</div>
              {player.cards && <div className="text-black font-semibold">{player.cards.length}</div>}
              {player.wins && <div className="text-black font-semibold"> | 👑{player.wins}</div>}
            </div>
          ))}
        </div>
        <WiDirectionUp className={`text-black font-semibold text-xl ${info.direction === "clockwise" ? "rotate-180" : ""}`} />
      </div>
    </div>
  );
};

const Card = ({ card, onClick = () => {}, type = "not-card", setIsOpen, color, setColor, classId }) => {
  const [id, setId] = useState(null);
  useEffect(() => {
    if (color && id === card?.id && ["draw4", "wild"].includes(card?.value)) {
      const newCard = { ...card, color };
      onClick(newCard);
      setColor(null);
      setId(null);
    }
  }, [color]);

  const getColor = (color) => {
    switch (color) {
      case "red":
        return "bg-[#D72600]";
      case "blue":
        return "bg-[#0956BF]";
      case "green":
        return "bg-[#379711]";
      case "yellow":
        return "bg-[#ECD407]";
      case "grey":
        return "bg-gray-500";
      default:
        return "bg-black";
    }
  };
  const getCardValue = (value) => {
    switch (value) {
      case "reverse":
        return <FaExchangeAlt className="text-black -rotate-45 text-2xl" />;
      case "skip":
        return <RiForbid2Line className="text-black text-2xl" />;
      case "draw2":
        return <div className="text-black text-xl">+2</div>;
      case "draw4":
        return <div className="text-white text-xl">+4</div>;
      case "wild":
        return <IoIosColorFilter className="text-white text-2xl" />;
      default:
        return value;
    }
  };
  return (
    <div
      id={classId || card.id}
      onClick={(e) => {
        if (card.value === "wild" || card.value === "draw4") {
          setId(card.id);
          setIsOpen(true);
        } else onClick(card, e);
      }}
      className={`${type === "card" ? "hover:scale-150 transition ease-in-out " : ""} ${
        type === "pioche" ? "p-3" : " w-[48px] h-[75px] "
      } flex items-center justify-center cursor-pointer border-2 border-white rounded ${getColor(card.color)}`}>
      {getCardValue(card.value)}
    </div>
  );
};

const Wrapper = ({ children, roomData, users, info }) => {
  return (
    <div id="game">
      <nav className="p-3 border-gray-700 bg-[#242531]">
        <div className="container flex flex-wrap items-center justify-center mx-auto">
          <div className="flex flex-row justify-center items-center">
            <img src={vengaicon} className="h-6 mr-3 sm:h-10 " alt="Venga Logo" />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">VengaGAMES</span>
            <h1 className="bg-[#FDFDFD] rounded-3xl text-center flex flex-row justify-center items-center ml-3 p-1 font-semibold">Room : {roomData.room}</h1>
          </div>
        </div>
      </nav>
      <div className="w-full h-full flex flex-col items-center justify-center p-3">
        <div className="w-fit absolute left-2 top-20">
          <NavLink to="/" end>
            <HiArrowLeft className="text-white transition min-w-[32px] min-h-[32px] ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300" />
          </NavLink>
        </div>
        <ConnectedPlayers players={users} info={info} />
        <div className="flex items-center flex-col w-full p-3">{children}</div>
      </div>
    </div>
  );
};

export default Login;
