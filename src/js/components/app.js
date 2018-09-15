import React from "react";
import PlayerList from "./PlayerList";
import PlayerForm from "./PlayerForm";
import 'bulma/css/bulma.css';
import '../../main.css';
const App = () => (
  <div className="columns">
    <div className="column is-two-thirds">
      <h2>Players</h2>
      <PlayerList />
    </div>
    <div className="column">
      <h2>Add a new player</h2>
      <PlayerForm />
    </div>
  </div>
);
export default App;
