/* eslint-disable react/prop-types */
import React from "react";

function AskForColor({ setColor, onclose }) {
  return (
    <div className="flex mb-8 flex-col items-center justify-center">
      <h2>Choose a color</h2>
      <div className="flex gap-2 flex-col">
        <div className="flex gap-2 ">
          <button
            className="bg-[#D72600] h-10 w-10 border-black border-2"
            onClick={() => {
              setColor("red");
              onclose();
            }}
          />
          <button
            className="bg-[#379711] h-10 w-10 border-black border-2"
            onClick={() => {
              setColor("green");
              onclose();
            }}
          />
        </div>

        <div className="flex gap-2 ">
          <button
            className="bg-[#0956BF] h-10 w-10 border-black border-2"
            onClick={() => {
              setColor("blue");
              onclose();
            }}
          />
          <button
            className="bg-[#ECD407] h-10 w-10 border-black border-2"
            onClick={() => {
              setColor("yellow");
              onclose();
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AskForColor;
