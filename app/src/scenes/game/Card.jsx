/* eslint-disable react/prop-types */
/* eslint-disable indent */
import React, { useEffect, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import { IoIosColorFilter } from "react-icons/io";
import { RiForbid2Line } from "react-icons/ri";

export const Card = ({ card, onClick = () => {}, type = "", setIsOpen, color, setColor, classId }) => {
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
      default:
        return "bg-black";
    }
  };
  const getCardValue = (value, color) => {
    switch (value) {
      case "reverse":
        return <FaExchangeAlt className={getNumberStyle(color)} />;
      case "skip":
        return <RiForbid2Line className={getNumberStyle(color)} />;
      case "draw2":
        return <div className={getNumberStyle(color)}>+2</div>;
      case "draw4":
        return <div className={getNumberStyle(color)}>+4</div>;
      case "wild":
        return <IoIosColorFilter className={getNumberStyle(color)} />;
      default:
        return <div className={getNumberStyle(color)}>{value}</div>;
    }
  };

  const getNumberStyle = (color) => {
    switch (color) {
      case "red":
        return "text-[#D72600]";
      case "blue":
        return "text-[#0956BF]";
      case "green":
        return "text-[#379711]";
      case "yellow":
        return "text-[#ECD407]";
      default:
        return "text-black font-bold text-2xl";
    }
  };

  return (
    <div
      id={classId || card.id}
      onClick={() => {
        if (card.value === "wild" || card.value === "draw4") {
          setId(card.id);
          setIsOpen(true);
        } else onClick(card, document.getElementById(classId || card.id));
      }}
      className={`${
        type === "card" ? "hover:scale-150 transition ease-in-out hover:z-50 " : ""
      } w-[60px] h-[100px] flex items-center justify-center cursor-pointer border-2 border-white rounded flex-wrap ${getColor(card.color)} `}>
      <div className="bg-white w-[50px] h-[80px] rotate-[30deg] rounded-[50px_/_80px] flex items-center justify-center">
        <div className="-rotate-[30deg] font-bold text-2xl shadow-black drop-shadow-[1px_1px_#232323]">{getCardValue(card.value, card.color)}</div>
      </div>
    </div>
  );
};
