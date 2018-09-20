import React from "react";
import EloChart from "./EloChart";
import PlayerList from "./PlayerList";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { eloEntries: state.eloEntries };
};

const Dashboard = ({eloEntries}) => (
	<div className="dashboard columns">
		<div className="column">
			<PlayerList />
		</div>
		<div className="column">
			<EloChart entries={eloEntries} title='Rating History of all players' />
		</div>
	</div>
);

export default connect(mapStateToProps)(Dashboard);