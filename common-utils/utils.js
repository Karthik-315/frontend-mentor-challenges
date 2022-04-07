"use strict";

/*
	This is a JS file with common utilities for all Freonend Mentor challenges.
*/

/* Variables */
const switchThemeButton = document.querySelector(".theme-button");
const lightThemeIcon = document.querySelector(".theme--light");
const darkThemeIcon = document.querySelector(".theme--dark");

let theme, storageThemeVariable;

/* Functions */
const setTheme = function (targetTheme) {
    if (targetTheme === "light") {
        document.body.classList.add("light-mode");
        lightThemeIcon.classList.add("hidden");
        darkThemeIcon.classList.remove("hidden");
    } else {
        document.body.classList.remove("light-mode");
        darkThemeIcon.classList.add("hidden");
        lightThemeIcon.classList.remove("hidden");
    }

    window.localStorage.setItem(storageThemeVariable, targetTheme);
};

const setInitialTheme = function () {
    try {
        if (!storageThemeVariable)
            throw "\
Looks like theme variable is not set.\n\
\nCall setStorageVariable(<string>) to set a theme variable to use for local storage\
                ";
    } catch (err) {
        console.error(err);
        return;
    }

    theme = window.localStorage.getItem(storageThemeVariable) || "dark";
    setTheme(theme);
};

const setStorageVariable = function (themeVariable) {
    storageThemeVariable = themeVariable;
    setInitialTheme();
};

/* Event Listeners */
switchThemeButton.addEventListener("click", function () {
    theme = window.localStorage.getItem(storageThemeVariable) || "dark";
    theme === "dark" ? setTheme("light") : setTheme("dark");
});
