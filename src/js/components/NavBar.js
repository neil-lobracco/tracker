import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import LeagueWidget from "./LeagueWidget";
import AuthWidget from "./AuthWidget";

const NavBar = () => {
    const [burgerized, setBurgerized] = useState(false);
    const toggleBurger = () => setBurgerized(!burgerized);
    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
            <a className="navbar-item" href="/">
                <img src="/logo.png" width="80" height="28"/>
            </a>
        
            <a role="button" className={`navbar-burger burger${burgerized ? ' is-active' : ''}`} aria-label="menu" aria-expanded="false" onClick={toggleBurger}>
                <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
            </a>
            </div>
        
            <div className={`navbar-menu${burgerized ? ' is-active' : ''}`} >
            <div className="navbar-start">
                <NavLink exact to='/' className='navbar-item' activeClassName='is-active'>Overview</NavLink>
                <NavLink to='/players' className='navbar-item' activeClassName='is-active'>Players</NavLink>
                <NavLink to='/matches' className='navbar-item' activeClassName='is-active'>Matches</NavLink>
            </div>
        
            <div className="navbar-end">
                <AuthWidget/>
                <LeagueWidget/>
            </div>
            </div>
        </nav>
            
    );
};
export default NavBar;