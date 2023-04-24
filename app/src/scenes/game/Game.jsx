/* eslint-disable indent */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../../service/api";
import useSocket from "../../hooks/socket";
import toast from "react-hot-toast";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { HiArrowLeft } from "react-icons/hi";
import { RiLoader2Fill, RiForbid2Line } from "react-icons/ri";
import { WiDirectionUp } from "react-icons/wi";
import { FaExchangeAlt } from "react-icons/fa";
import { IoIosColorFilter } from "react-icons/io";
import AskForColor from "../../components/AskForColor";
import { VITE_ENV } from "../../config";

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
    socket.on("roomData", ({ users }) => setUsers(users));
    socket.emit("draw-cards", 7);
    socket.on("the-cards", (cards) => setDeck((prev) => [...prev, ...cards]));
    socket.on("draw-first-card", ({ card }) => setActualCard(card));

    socket.on("the-card", (card) => setDeck((prev) => [...prev, card]));
    socket.on("played-card", ({ card }) => {
      setActualCard(card);
    });
    socket.on("next-player-to-play", (user) => {
      setGameInfo((prev) => ({ ...prev, playerToPlay: user }));
    });
    socket.on("reverse", ({ direction }) => {
      setGameInfo((prev) => ({ ...prev, direction: direction }));
    });

    socket.on("draw-multiple", ({ stack }) => {
      setGameInfo((prev) => ({ ...prev, stack: stack }));
    });

    socket.on("player-left", () => {
      getCurrentPlayer(room);
    });

    socket.on("player-won", ({ user }) => {
      alert(`${user.name} a gagné !`);
    });

    if (VITE_ENV !== "development")
      window.onbeforeunload = function () {
        return "Data will be lost if you leave the page, are you sure?";
      };

    return () => {
      socket.emit("leave-room");
    };
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;
    socket.emit("card-numbers", deck.length);
    if (deck.length === 0) {
      socket.emit("winner");
    }
  }, [deck]);

  const getDefaultCard = async (room) => {
    const { data } = await API.get(`/cards/default/${room}`);
    setActualCard(data);
  };

  const getCurrentPlayer = async (room) => {
    const { data } = await API.get(`/room/current/${room}`);
    setGameInfo((prev) => ({ ...prev, playerToPlay: data }));
  };

  const playCard = (card) => {
    socket.emit("play-card", { card }, (res) => {
      if (!res.ok) return toast.error(res.error);

      setDeck((prev) => prev.filter((c) => c.id !== card.id));
    });
  };

  const drawCard = () => {
    socket.emit("draw-card", (res) => {
      if (!res.ok) return toast.error(res.error);
    });
  };

  const sortCards = () => {
    setDeck((prev) => {
      const sorted = prev.sort((a, b) => {
        if (a.color === b.color) {
          return a.value - b.value;
        }
        return a.color.localeCompare(b.color);
      });
      return [...sorted];
    });
  };

  const playAgain = () => {
    socket.emit("play-again", () => {
      socket.emit("get-default-card");
    });
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div>Connexion en cours...</div>
        <RiLoader2Fill className="animate-spin text-7xl" />
      </div>
    );
  }

  return (
    <Wrapper roomData={roomData} users={users} info={gameInfo}>
      <div>Jeu</div>
      <div className={`${isModalOpen ? "block" : "hidden"}`}>
        <AskForColor setColor={setColor} onclose={() => setIsOpen(false)} />
      </div>
      <div className={`${isModalOpen ? "hidden" : "block"} flex items-center flex-col`}>
        <div className="flex gap-6">
          {gameInfo.stack && <div className="text-2xl">Stack : +{gameInfo.stack}</div>}
          {actualCard && <Card card={actualCard} />}
          <Card card={{ color: "grey", value: "Pioche" }} type="pioche" onClick={() => drawCard()} />
        </div>
        {deck.length !== 0 ? (
          <div className="flex mt-24">
            <button onClick={() => sortCards()}>Trier</button>
          </div>
        ) : (
          <div onClick={() => playAgain()} className="flex mt-24 text-2xl border rounded border-black p-5 cursor-pointer">
            Rejouer ?
          </div>
        )}
        <div className="flex max-w-xl flex-wrap flex-row gap-2">
          {deck.map((card) => (
            <Card type="card" onClick={playCard} key={card.id} card={card} setIsOpen={setIsOpen} color={color} setColor={setColor} />
          ))}
        </div>
      </div>
    </Wrapper>
  );
};

const ConnectedPlayers = ({ players, info }) => {
  const [showPlayers, setShowPlayers] = useState(true);
  players.sort((a, b) => {
    a.name.localeCompare(b.name);
  });
  players.sort((a, b) => {
    if (a.admin && !b.admin) return -1;
    if (!a.admin && b.admin) return 1;
    return 0;
  });
  return (
    <div onClick={() => setShowPlayers((prev) => !prev)} className="flex flex-col h-fit p-3 border border-black rounded-lg items-center">
      <div className="">Joueurs</div>
      <div className="flex items-center gap-3">
        {showPlayers ? (
          <div className="flex flex-col gap-2">
            {players.map((player) => (
              <div key={player.id} className="flex gap-2 justify-end">
                {player.admin && <MdOutlineAdminPanelSettings className="text-red-500" />}
                <div className={`${player.id === info?.playerToPlay?.id ? "text-green-500" : "text-black"}`}>{player.name}</div>
                {player.cardsNb && <div className="text-black">{player.cardsNb}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-black">{players.length} joueurs connectés</div>
        )}
        <WiDirectionUp className={`text-black text-xl ${info.direction === "clockwise" ? "rotate-180" : ""}`} />
      </div>
    </div>
  );
};

const Card = ({ card, onClick = () => {}, type = "not-card", setIsOpen, color, setColor }) => {
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
      onClick={() => {
        if (card.value === "wild" || card.value === "draw4") {
          setId(card.id);
          setIsOpen(true);
        } else onClick(card);
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
    <div className="w-full h-full flex flex-col items-center justify-center p-3">
      <div className="flex mb-4 flex-row justify-between items-center w-full">
        <NavLink to="/" end>
          <HiArrowLeft className="transition min-w-[32px] min-h-[32px] ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300" alt="icone fleche retour" />
        </NavLink>
        <h1 className="flex items-center">Room : {roomData.room}</h1>
        <div />
      </div>
      <ConnectedPlayers players={users} info={info} />
      <div className="flex items-center flex-col w-full p-3">{children}</div>
    </div>
  );
};

export default Login;
