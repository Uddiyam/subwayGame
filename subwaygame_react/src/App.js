import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameRoom from "./GameRoom";
import WaitingRoom from "./WatingRoom";
import Result from "./Result";

const App = () => {
  return (
    <Routes>
      <>
        <Route exact path="/" element={<WaitingRoom />} />
        <Route exact path="/GameRoom" element={<GameRoom />} />
        <Route exact path="/Result" element={<Result />} />
      </>
    </Routes>
  );
};

export default App;
