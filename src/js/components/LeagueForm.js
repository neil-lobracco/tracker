import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { createLeague, loadSports } from "../actions/index";
import FormField from "./FormField";

const SportSelectionField = React.memo(({onChange, sport, sports}) => (
  <FormField>
    <select
        required="required"
        name="sport_id"
        value={sport}
        onChange={onChange}>
        <option value="" disabled="disabled">Select a sport</option>
        {(sports || []).map(sport => (
            <option key={sport.id} value={sport.id}>{sport.name}</option>
        ))}
    </select>
  </FormField>));

const initialState = {
    members_only: false,
    name: '',
    description: '',
    sport_id: '',
    domain: '',
}

const LeagueForm = ({ sports, loadSports, createLeague }) => {
  const [state, setState] = useState(initialState);
  useEffect(() => {
    if (!sports) {
      loadSports();
    }
  }, []);
  const onFieldChange = (event) => {
    let val = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (event.target.name == 'sport_id') { val = parseInt(val); }
    setState({ ...state,  [event.target.name]:  val});
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    let cleaned = {...state, description: state.description || null, domain: state.domain || null };
    createLeague(cleaned);
    setState(initialState);
  };
  const submitDisabled = !(state.name && state.sport_id);
  const { name, description, domain, members_only, sport_id } = state;
  return (
    <form onSubmit={handleSubmit}>
      <FormField description="Name">
        <input
            type="text"
            className="input is-primary"
            name="name"
            required='required'
            placeholder="Enter the league name"
            value={name}
            onChange={onFieldChange}
        />
      </FormField>
      <FormField description="Description (optional)">
        <textarea
            className="textarea"
            name="description"
            placeholder="Description of this league"
            value={description}
            onChange={onFieldChange}
        />
      </FormField>
      <FormField description="Domain restriction (optional)">
        <input
            type="text"
            className="input is-primary"
            name="domain"
            placeholder="Members' emails must be @ this domain"
            value={domain}
            onChange={onFieldChange}
        />
      </FormField>
      <FormField description="Members Only">
        <input
            type="checkbox"
            name="members_only"
            checked={members_only}
            onChange={onFieldChange}
        />
      </FormField>
      <SportSelectionField sport={sport_id} onChange={onFieldChange} sports={sports} />
      <button type="submit" disabled={submitDisabled} className="button is-primary">
        Create League
      </button>
    </form>
  );
};

const mapStateToProps = state => ({
  sports: state.sports,
});
const mapDispatchToProps = dispatch => {
  return {
    loadSports: () => dispatch(loadSports()),
    createLeague: (league) => dispatch(createLeague(league))
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(LeagueForm);
