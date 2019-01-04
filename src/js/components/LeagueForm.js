import React, { PureComponent } from "react";
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

class LeagueForm extends PureComponent {
  constructor() {
    super();
    this.state = initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
      if (!this.props.sports) {
          this.props.loadSports();
      }
  }

  handleChange(event) {
    let val = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (event.target.name == 'sport_id') { val = parseInt(val); }
    this.setState({ [event.target.name]:  val});
  }

  handleSubmit(event) {
    event.preventDefault();
    let cleaned = {...this.state, description: this.state.description || null, domain: this.state.domain || null };
    this.props.createLeague(cleaned);
    this.setState(initialState);
  }

  isDisabled() {
      return !(this.state.name && this.state.sport_id);
  }

  render() {
    const { name, description, domain, members_only, sport_id } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <FormField description="Name">
          <input
              type="text"
              className="input is-primary"
              name="name"
              required='required'
              placeholder="Enter the league name"
              value={name}
              onChange={this.handleChange}
          />
        </FormField>
        <FormField description="Description (optional)">
          <textarea
              className="textarea"
              name="description"
              placeholder="Description of this league"
              value={description}
              onChange={this.handleChange}
          />
        </FormField>
        <FormField description="Domain restriction (optional)">
          <input
              type="text"
              className="input is-primary"
              name="domain"
              placeholder="Members' emails must be @ this domain"
              value={domain}
              onChange={this.handleChange}
          />
        </FormField>
        <FormField description="Members Only">
          <input
              type="checkbox"
              name="members_only"
              checked={members_only}
              onChange={this.handleChange}
          />
        </FormField>
        <SportSelectionField sport={sport_id} onChange={this.handleChange} sports={this.props.sports} />
        <button type="submit" disabled={this.isDisabled()} className="button is-primary">
          Create League
        </button>
      </form>
    );
  }
}

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
