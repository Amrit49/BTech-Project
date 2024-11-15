import React from "react";
import NavBar from "./NavBar";
// import Calendar from "react-calendar";
import './MainPage.css';
import HomePage from "./HomePage";

const MainPage = () => {
    return(
        <div className="main-page">
            <NavBar/>
            <HomePage />
        </div>
    );
};

export default MainPage;