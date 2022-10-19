import renderMap from "./renderMap";

const attachGame = async (canvasRef, socket) => {
  const ctx = canvasRef.current.getContext("2d");
  console.log("asd", canvasRef.current);
  renderMap(ctx);
};

export default attachGame;
