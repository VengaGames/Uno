import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import API from "../../service/api";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { HiArrowLeft } from "react-icons/hi";
import useSocket from "../../hooks/socket";
import { RiLoader2Fill } from "react-icons/ri";

const Login = () => {
  const query = new URLSearchParams(window.location.search);
  const { socket, isConnected } = useSocket();
  const roomData = {
    name: query.get("name"),
    room: query.get("room"),
  };
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isConnected) return;
    const { name, room } = roomData;
    socket.emit("join", { name, room }, () => {
      getSettings();
    });
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    return () => {
      socket.emit("leave-room");
    };
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;
    if (selectedVideo) {
      socket.emit("select-video", selectedVideo);
    } else {
      socket.emit("select-video", null);
    }
  }, [selectedVideo, isConnected]);

  if (!isConnected)
    return (
      <div className="flex flex-col items-center gap-5">
        <div>Connexion en cours...</div>
        <RiLoader2Fill className="animate-spin text-7xl" />
      </div>
    );

  return (
    <Wrapper roomData={roomData} users={users}>
      <div>Jeu</div>
    </Wrapper>
  );
};

const ConnectedPlayers = ({ players }) => {
  const [showPlayers, setShowPlayers] = useState(true);
  players.sort((a, b) => {
    if (a.videoSelected && !b.videoSelected) return -1;
    if (!a.videoSelected && b.videoSelected) return 1;
    return 0;
  });
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
              <div className={`${player.videoSelected ? "text-green-500" : "text-black"}`}>{player.name}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-black">{players.length} joueurs connectés</div>
      )}
    </div>
  );
};

const Wrapper = ({ children, roomData, users }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3">
      <div className="flex mb-4 flex-row justify-between items-center w-full">
        <NavLink to="/login" end>
          <HiArrowLeft className="transition min-w-[32px] min-h-[32px] ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300" alt="icone fleche retour" />
        </NavLink>

        <h1 className="flex items-center">Room : {roomData.room}</h1>
        <div />
      </div>
      <ConnectedPlayers players={users} />
      <div className="flex items-center flex-col w-full p-3">{children}</div>
    </div>
  );
};

export default Login;
