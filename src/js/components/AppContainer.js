import React, {Fragment} from "react";
import { connect } from "react-redux";
import LoadingWidget from "./LoadingWidget";
const AppContainer = ({isLoading, children}) => {
    return (
        <Fragment>
            <div className={`container ${isLoading ? 'fade-out' : 'fade-in'}`}>
                {children}
            </div>
		    <LoadingWidget/>
        </Fragment>
    );
};
export default connect(state => ({isLoading : state.loading.numPending > 0 }))(AppContainer);