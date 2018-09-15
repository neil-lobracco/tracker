import React from "react";
import { connect } from "react-redux";
const mapStateToProps = state => {
  return { players: state.players };
};
const ConnectedList = ({ players }) => (
  <ul className="list-group list-group-flush">
    {players.map(el => (
      <li className="list-group-item" key={el.id}>
        {el.name}
      </li>
    ))}
  </ul>
);
const List = connect(mapStateToProps)(ConnectedList);
export default List;
