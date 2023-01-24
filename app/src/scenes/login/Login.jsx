import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../service/api";
import { HiArrowLeft } from "react-icons/hi";
import { NavLink } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);

  const getRooms = async () => {
    const { data } = await API.get("/room");
    setRooms(data);
  };

  useEffect(() => {
    getRooms();
  }, []);

  const handlesubmit = async (e) => {
    e.preventDefault();
    const room = e.target.elements.room.value;
    const name = e.target.elements.name.value;
    const { ok } = await API.get(`/room/name/available?room=${room}&name=${name}`);
    if (!ok) {
      alert("Nom de room ou de joueur déjà pris");
      return;
    }
    navigate(`/game?room=${room}&name=${name}`);
  };
  return (
    <div>
      <div className="w-full h-full flex flex-col items-center justify-center mt-24">
        <div className="bg-white justify-center flex flex-col border rounded-lg border-gray-500 items-center shadow-2xl w-3/4 md:w-1/4">
          <h1 className="mt-5 text-xl font-semibold">Uno !</h1>
          <form onSubmit={handlesubmit} className="flex flex-col">
            <label className="ml-2.5 mt-2.5" htmlFor="room">
              Room
            </label>
            <input
              placeholder="Nom de la room..."
              autoComplete="off"
              className="border border-gray-500 rounded-lg w-5/6 ml-2.5 mb-1 focus:bg-regal-purple outline-1 outline-black"
              required
              type="text"
              name="room"
              id="room"
              onInvalid={(e) => {
                e.target.setCustomValidity("Choisis une salle !");
              }}
            />
            <label className="ml-2.5 mt-2.5" htmlFor="name">
              Pseudo
            </label>
            <input
              placeholder="Ton Pseudo..."
              autoComplete="off"
              className="border border-gray-500 rounded-lg w-5/6 ml-2.5 mb-1 focus:bg-regal-purple outline-1 outline-black"
              required
              type="text"
              name="name"
              onInvalid={(e) => {
                e.target.setCustomValidity("Choisis un pseudo !");
              }}
            />
            <div className="flex flex-col items-center">
              <button className="bg-regal-purple rounded-lg border text-white mt-2 mb-2 w-20" type="submit">
                Rejoindre
              </button>
            </div>
          </form>
        </div>
        {rooms.length > 0 ? (
          <div className="mt-8">
            <h1 className="text-lg mb-2">Salles disponibles :</h1>
            <div className="flex flex-col gap-2">
              {rooms.map((room) => (
                <div key={room.name} className="flex gap-2 cursor-pointer" onClick={() => (document.getElementById("room").value = room.name)}>
                  <div>{room.name}</div>
                  <div>
                    ({room.usersNb} joueur{room.usersNb > 1 ? "s" : ""})
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="fixed bottom-0 flex justify-center w-full">
        <h3> Vengaboys © - 2023</h3>
      </div>
    </div>
  );
};

export default Login;
