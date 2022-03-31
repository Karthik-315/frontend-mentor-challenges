"use strict";

/* Variables */
const switchThemeButton = document.querySelector(".theme-button");
const lightThemeIcon = document.querySelector(".theme--light");
const darkThemeIcon = document.querySelector(".theme--dark");

const adviceTitleContainer = document.querySelector(".advice-title");
const adviceTextContainer = document.querySelector(".advice-text");

const dividerImageContainer = document.querySelector(".divider-image");
let dividerImageFile = "./images/pattern-divider-mobile.svg";

const newAdviceButton = document.querySelector(".new-advice-button");

let theme;
const adviceURL = "https://api.adviceslip.com/advice";

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

    window.localStorage.setItem("theme", targetTheme);
};

const setContent = function () {
    //Set divider image based on screen size.
    const deviceWidth = window.innerWidth > 0 ? window.innerWidth : screen.width;

    deviceWidth > 768 && (dividerImageFile = "./images/pattern-divider-desktop.svg");

    dividerImageContainer.src = dividerImageFile;
};

const getAdvice = async function () {
    const advice = await fetch(adviceURL)
        .then((response) => {
            if (response.ok) return response.json();
            else {
                console.log(response);
            }
        })
        .catch((err) => {
            console.error(`An error occured ${err.message}`);
            return;
        });

    console.log(advice.slip.advice);
    console.log(advice.slip.id);

    displayAdvice(advice.slip.id, advice.slip.advice);
};

const displayAdvice = function (id, advice) {
    adviceTitleContainer.innerHTML = `Advice #${id}`;
    adviceTextContainer.innerHTML = advice;
};

const initialize = function () {
    setContent();
    getAdvice();

    theme = window.localStorage.getItem("theme") || "dark";
    setTheme(theme);
};

initialize();

/* Event Listeners */
newAdviceButton.addEventListener("click", function () {
    initialize();
    newAdviceButton.classList.add("animate");

    setTimeout(() => newAdviceButton.classList.remove("animate"), 2500);
});

switchThemeButton.addEventListener("click", function () {
    theme = window.localStorage.getItem("theme") || "dark";
    console.log(`Theme: ${theme}`);
    console.log(`Theme from local: ${window.localStorage.getItem("theme")}`);
    theme === "dark" ? setTheme("light") : setTheme("dark");
});
