import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import API from "../../service/api";
import useSocket from "../../hooks/socket";
import toast from "react-hot-toast";
import { MdOutlineAdminPanelSettings, MdExposurePlus2 } from "react-icons/md";
import { HiArrowLeft } from "react-icons/hi";
import { RiLoader2Fill, RiForbid2Line } from "react-icons/ri";
import { WiDirectionUp } from "react-icons/wi";
import { FaExchangeAlt } from "react-icons/fa";
import { IoIosColorFilter } from "react-icons/io";

const Login = () => {
  const query = new URLSearchParams(window.location.search);
  const { socket, isConnected } = useSocket();
  const roomData = {
    name: query.get("name"),
    room: query.get("room"),
  };
  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState([]);
  const [actualCard, setActualCard] = useState(null);
  const [gameInfo, setGameInfo] = useState({ direction: "clockwise" });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isConnected) return;
    // initUser
    const { name, room } = roomData;
    socket.emit("join", { name, room }, (error) => {
      if (error) {
        alert(error);
      }
      getDefaultCard(room);
      getCurrentPlayer(room);
    });
    socket.on("roomData", ({ users }) => setUsers(users));
    socket.emit("draw-cards", 7);
    socket.on("the-cards", (cards) => setDeck(cards));
    socket.on("draw-first-card", ({ card }) => setActualCard(card));

    socket.on("the-card", (card) => setDeck((prev) => [...prev, card]));
    socket.on("played-card", ({ card }) => setActualCard(card));
    socket.on("next-player-to-play", (user) => {
      setGameInfo((prev) => ({ ...prev, playerToPlay: user }));
    });
    socket.on("reverse", () => {
      setGameInfo((prev) => ({ ...prev, direction: prev.direction === "clockwise" ? "counter-clockwise" : "clockwise" }));
    });

    socket.on("player-left", () => {
      getCurrentPlayer(room);
    });

    socket.on("player-won", ({ user }) => {
      alert(`${user.name} a gagné !`);
    });

    if (import.meta.env.VITE_ENVIRONNEMENT !== "development")
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

  if (!isConnected)
    return (
      <div className="flex flex-col items-center gap-5">
        <div>Connexion en cours...</div>
        <RiLoader2Fill className="animate-spin text-7xl" />
      </div>
    );

  const getDefaultCard = async (room) => {
    const { data } = await API.get(`/cards/default/${room}`);
    setActualCard(data);
  };

  const getCurrentPlayer = async (room) => {
    const { data } = await API.get(`/room/current/${room}`);
    setGameInfo((prev) => ({ ...prev, playerToPlay: data }));
  };

  const playCard = (card) => {
    if (isYourTurn()) return;
    // verify if card is playable
    if (verifyCard(card)) return toast.error("Cette carte n'est pas jouable !");
    socket.emit("play-card", { card: card }, () => {
      socket.emit("next-turn");
    });
    setActualCard(card);
    setDeck((prev) => prev.filter((c) => c.id !== card.id));
  };

  const verifyCard = (card) => {
    if (card.color === actualCard.color || card.value === actualCard.value) return false;
    return true;
  };

  const drawCard = () => {
    if (isYourTurn()) return;
    socket.emit("draw-card");
  };

  const isYourTurn = () => {
    if (!gameInfo.playerToPlay) return false;

    if (gameInfo.playerToPlay?.id !== socket.id) toast.error("Ce n'est pas votre tour !");
    if (users.length === 1) toast.error("Vous êtes seul dans la partie !");

    return gameInfo.playerToPlay?.id !== socket.id || !(users.length > 1);
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

  return (
    <Wrapper roomData={roomData} users={users} info={gameInfo}>
      <div>Jeu</div>
      <div className="flex gap-6">
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
          <Card type="card" onClick={() => playCard(card)} key={card.id} card={card} />
        ))}
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

const Card = ({ card, onClick = () => {}, type = "not-card" }) => {
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
        return <FaExchangeAlt className="text-black -rotate-45 text-xl" />;
      case "skip":
        return <RiForbid2Line className="text-black text-xl" />;
      case "draw2":
        return <MdExposurePlus2 className="text-black text-xl" />;
      case "draw4":
        return "+4";
      case "wild":
        return <IoIosColorFilter className="text-black text-xl" />;
      default:
        return value;
    }
  };
  return (
    <div
      onClick={() => onClick()}
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
