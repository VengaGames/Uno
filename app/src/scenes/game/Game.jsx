import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import API from "../../service/api";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { HiArrowLeft } from "react-icons/hi";
import useSocket from "../../hooks/socket";
import { RiLoader2Fill } from "react-icons/ri";
import toast from "react-hot-toast";

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
  const [playerToPlay, setPlayerToPlay] = useState(null);

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
      setPlayerToPlay(user);
    });

    socket.on("player-left", () => {
      getCurrentPlayer(room);
    });

    socket.on("player-won", ({ user }) => {
      alert(`${user.name} a gagné !`);
    });

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
    setPlayerToPlay(data);
  };

  const playCard = (card) => {
    if (isYourTurn()) return;
    // verify if card is playable
    if (card.color !== actualCard.color && card.value !== actualCard.value) return;
    socket.emit("play-card", card);
    socket.emit("next-turn");
    setActualCard(card);
    setDeck((prev) => prev.filter((c) => c.id !== card.id));
  };

  const drawCard = () => {
    if (isYourTurn()) return;
    socket.emit("draw-card");
  };

  const isYourTurn = () => {
    if (!playerToPlay) return false;

    if (playerToPlay?.id !== socket.id) toast.error("Ce n'est pas votre tour !");
    if (users.length === 1) toast.error("Vous êtes seul dans la partie !");

    return playerToPlay?.id !== socket.id || !(users.length > 1);
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
    <Wrapper roomData={roomData} users={users} whosTurn={playerToPlay}>
      <div>Jeu</div>
      <div className="flex gap-6">
        {actualCard && <Card card={actualCard} />}
        <Card card={{ color: "grey", value: "Pioche" }} onClick={() => drawCard()} />
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
          <Card onClick={() => playCard(card)} key={card.id} card={card} />
        ))}
      </div>
    </Wrapper>
  );
};

const ConnectedPlayers = ({ players, whosTurn }) => {
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
      {showPlayers ? (
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <div key={player.id} className="flex gap-2">
              {player.admin && <MdOutlineAdminPanelSettings className="text-red-500" />}
              <div className={`${player.id === whosTurn?.id ? "text-green-500" : "text-black"}`}>{player.name}</div>
              {player.cardsNb && <div className="text-black">{player.cardsNb}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-black">{players.length} joueurs connectés</div>
      )}
    </div>
  );
};

const Card = ({ card, onClick }) => {
  const getColor = (color) => {
    switch (color) {
      case "red":
        return "bg-red-500 border-red-500";
      case "blue":
        return "bg-blue-500 border-blue-500";
      case "green":
        return "bg-green-500 border-green-500";
      case "yellow":
        return "bg-yellow-500 border-yellow-500";
      case "grey":
        return "bg-gray-500 border-gray-500";
      default:
        return "bg-black border-black";
    }
  };
  return (
    <div onClick={() => onClick()} className={`p-3 hover:animate-bounce select-text cursor-pointer border rounded ${getColor(card.color)}`}>
      {card.value}
    </div>
  );
};

const Wrapper = ({ children, roomData, users, whosTurn }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3">
      <div className="flex mb-4 flex-row justify-between items-center w-full">
        <NavLink to="/" end>
          <HiArrowLeft className="transition min-w-[32px] min-h-[32px] ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300" alt="icone fleche retour" />
        </NavLink>

        <h1 className="flex items-center">Room : {roomData.room}</h1>
        <div />
      </div>
      <ConnectedPlayers players={users} whosTurn={whosTurn} />
      <div className="flex items-center flex-col w-full p-3">{children}</div>
    </div>
  );
};

export default Login;
