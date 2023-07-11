import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Game from "./scenes/game/Game";

function App() {
  return (
    <div className="App">
      <Toaster />
      <Router>
        <Routes>
          <Route path="/game" element={<Game />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
