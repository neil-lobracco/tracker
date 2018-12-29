import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { createLeague, loadSports } from "../actions/index";

const mapStateToProps = state => ({
    sports: state.sports,
});
const mapDispatchToProps = dispatch => {
  return {
    loadSports: () => dispatch(loadSports()),
    createLeague: (league) => dispatch(createLeague(league))
  };
};

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
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className="field">
          <label className="label">Name
            <input
                type="text"
                className="input is-primary"
                name="name"
                required='required'
                placeholder="Enter the league name"
                value={name}
                onChange={this.handleChange.bind(this)}
            />
          </label>
        </div>
        <div className="field">        
          <label className="label">Description (optional)
            <textarea
                className="textarea"
                name="description"
                placeholder="Description of this league"
                value={description}
                onChange={this.handleChange.bind(this)}
            />
          </label>
        </div>
        <div className="field">
          <label className="label">Domain restriction (optional)
            <input
                type="text"
                className="input is-primary"
                name="domain"
                placeholder="Members' emails must be @ this domain"
                value={domain}
                onChange={this.handleChange.bind(this)}
            />
          </label>
        </div>
        <div className="field">        
          <label className="label">Members Only
            <input
                type="checkbox"
                name="members_only"
                checked={members_only}
                onChange={this.handleChange.bind(this)}
            />
          </label>
        </div>
        <div className="field">
          <div className='select is-info'>
            <select
                required="required"
                name="sport_id"
                value={sport_id}
                onChange={this.handleChange.bind(this)}>
                <option value="" disabled="disabled">Select a sport</option>
                {(this.props.sports || []).map(sport => (
                    <option key={sport.id} value={sport.id}>{sport.name}</option>
                ))}
            </select>
          </div>
        </div>
        <button type="submit" disabled={this.isDisabled()} className="button is-primary">
          Create League
        </button>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LeagueForm);
