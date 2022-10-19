import { useEffect, useRef } from "react";
import attachGame from "./Game/attachGame";
import "./App.css";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // TODO: set up socket connection
    // TODO: mount game to canvas
    attachGame(canvasRef);
  }, []);

  return (
    <div className="App">
      <canvas id="game" ref={canvasRef} />
    </div>
  );
}

export default App;
