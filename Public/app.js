// app.js
// JavaScript code goes here
import {RadioBrowserApi} from 'https://cdn.skypack.dev/radio-browser-api';

let categorySection, radioSection, categoryItems, radioItems, categoryNavigationItems, radioNavigationItems;
const sectionList = {CATEGORY: 'category', RADIO: 'radio'};
let currentSectionDisplayed;
let categoryNameDiv;
let intervalID;
let menuIntervalID;

/**
 * Represents the length that a certain station is highlighted
 * @type {number}
 */
let highlightDelaySeconds = 1;

let currentIndex = 0;

/**
 * Used when we are paused at a given currentIndex
 * @type {number}
 */
let currentMenuIndex = 0;

let radioPlaying = false;
let categoryStartIndex = 0;
let numCategoriesDisplayed = 8;
let radioStartIndex = 0;
let numRadiosDisplayed = 5;

/**
 * Represents the index of the settings
 */
let settingsIndex;

let navigationSelected = false;

const HIGHLIGHT_ITEM_STYLE = "highlighted-item";

const radioBrowserApi = new RadioBrowserApi('My Radio App')

let categoryList = {
    "All": "/Assets/audio-waves.png",
    "70s": "/Assets/abstract.png",
    "80s": "/Assets/80s.png",
    "90s": "/Assets/90s.png",
    "Alternative": "/Assets/drum-set.png",
    "Christmas": "/Assets/wreath.png",
    "Classical": "/Assets/viola.png",
    "Country": "/Assets/guitar.png",
    "EDM": "/Assets/birthday-and-party.png",
    "Folk": "/Assets/vinyl-disc.png",
    "Hip-Hop": "/Assets/hip-hop.png",
    "International": "/Assets/earth.png",
    "Jazz": "/Assets/saxophone.png",
    "K-pop": "/Assets/kpop.png",
    "Kids": "/Assets/tambourine.png",
    "News": "/Assets/newspaper.png",
    "Oldies": "/Assets/sixties.png",
    "Pop": "/Assets/microphone.png",
    "Rock": "/Assets/electric-guitar.png",
    "Sports": "/Assets/sports.png",
    "Talk": "/Assets/podcast.png",
    "Top 40": "/Assets/40.png"
};

document.addEventListener('DOMContentLoaded', function () {
    categoryItems = document.querySelectorAll(".category-item");
    radioItems = document.querySelectorAll(".radio-item");
    categorySection = document.querySelector("#category-tab-section");
    radioSection = document.querySelector("#radio-tab-section");
    categoryNameDiv = document.querySelector("#category-name");
    categoryNavigationItems = document.querySelectorAll(".category-navigation-icon");
    radioNavigationItems = document.querySelectorAll(".radio-navigation-icon");

    // set current tab displayed
    currentSectionDisplayed = sectionList.CATEGORY;
    radioSection.style.display = "none";

    displayCategories();

    //starting highlighting process
    highlightGridItems(categoryItems);
});

document.addEventListener('keydown', function (e) {
    const keyPressed = e.key;
    if (keyPressed === "s") {
        if (currentSectionDisplayed === sectionList.CATEGORY) {
            if (navigationSelected) {
                handleSKeyPressedNavigation();
            } else {
                if (currentIndex === settingsIndex) {
                    clearInterval(intervalID); // Highlight pauses on this item
                    highlightMenuItems(categoryNavigationItems);
                    navigationSelected = true;
                    // Otherwise a category is selected
                } else {
                    handleSKeyPressedCategory();
                }
            }
        }

        if (currentSectionDisplayed === sectionList.RADIO) {
            if (navigationSelected) {
                handleSKeyPressedRadioNavigation();
            } else {
                if (currentIndex === settingsIndex) {
                    clearInterval(intervalID);
                    highlightMenuItems(radioNavigationItems);
                    navigationSelected = true;
                    // Otherwise a radio is selected
                } else {
                    handleSKeyPressedRadio();
                }
            }
        }
    }
})

// Displays the next set of categories
function displayCategories() {
    let element;
    for (let index = 0; index < categoryItems.length; index++) {
        element = categoryItems[index];

        if (index >= categoryStartIndex && index < categoryStartIndex + numCategoriesDisplayed) {
            element.style.display = "inline-flex";
        } else {
            element.style.display = "none";
        }
    }

    settingsIndex = [...categoryItems].filter(gridItem => gridItem.style.display !== "none" && gridItem.id !== "navigation-item").length;

    element = document.getElementById("category-navigation-item");
    element.style.display = "inline-flex";
}

// Displays the next set of radios
function displayRadioStations() {
    let element;
    for (let index = 0; index < radioItems.length; index++) {
        element = radioItems[index];

        if (index >= radioStartIndex && index < radioStartIndex + numRadiosDisplayed) {
            element.style.display = "inline-flex";
        } else {
            element.style.display = "none";
        }
    }

    settingsIndex = [...radioItems].filter(gridItem => gridItem.style.display !== "none" && gridItem.id !== "navigation-item").length;

    element = document.getElementById("radio-navigation-item");
    element.style.display = "inline-flex";
}

async function handleSKeyPressedCategory() {
    await getRadioStationsByCategory().then(stationList => {
        toggleTabVisibility(stationList);
    });
}

function playPauseRadio(radioPlayer) {
    if (radioPlaying) {
        radioPlayer.pause();
        radioPlaying = false;
        toggleRadioControlVisibility(radioItems[currentIndex]);
    } else {
        radioPlayer.play();
        radioPlaying = true;
        toggleAudioControlVisibility(radioItems[currentIndex]);
    }

}

async function handleSKeyPressedRadio() {
    let radioPlayer = radioItems[currentIndex].querySelector(".radio-audio");

    if (!radioPlaying) {
        clearInterval(intervalID); // Highlight pauses on this item
        await radioPlayer.play();
        radioPlaying = true;
        toggleAudioControlVisibility();
        toggleRadioControlVisibility(radioItems[currentIndex]);
    } else {
        if (currentMenuIndex === 0) { // pause
            playPauseRadio(radioPlayer);
        } else { // select new
            radioPlayer.pause();
            radioPlaying = false;
            toggleAudioControlVisibility();
            highlightGridItems(radioItems, false);
        }
    }
}

// Handles the case when the one of the navigation buttons is pressed
function handleSKeyPressedNavigation() {
    if (currentMenuIndex ===  0) { // Refresh button
        // Show the next page of categories
        if (categoryStartIndex + numCategoriesDisplayed > categoryItems.length) {
            categoryStartIndex = 0;
        } else {
            categoryStartIndex += numCategoriesDisplayed;
        }

        categoryNavigationItems.forEach(item => item.classList.remove(HIGHLIGHT_ITEM_STYLE));

        displayCategories();
        highlightGridItems(categoryItems);
        navigationSelected = false;
    } else {
        // TODO: display the settings page
    }
}

// Handles the selection of the navigation buttons on the category page
function handleSKeyPressedRadioNavigation() {
    if (currentMenuIndex === 0) { // refresh button
        // Show the next page of radios
        if (radioStartIndex + numCategoriesDisplayed > radioItems.length) {
            radioStartIndex = 0;
        } else {
            radioStartIndex += numRadiosDisplayed;
        }

        displayRadioStations();
        highlightGridItems(radioItems);
    } else { // Go back to categories
        toggleTabVisibility();
    }

    radioNavigationItems.forEach(item => item.classList.remove(HIGHLIGHT_ITEM_STYLE));
    navigationSelected = false
}

function displayRadioStationsInformation(stationList) {
    let radioNameElements = document.querySelectorAll(".radio-item-name")
    let radioPlayers = document.querySelectorAll(".radio-audio")

    radioNameElements.forEach((element, index) => {
        element.textContent = stationList[index].name;
    });

    radioPlayers.forEach((element, index) => {
        element.src = stationList[index].urlResolved;
    });
}

function highlightMenuItems(iconItems) {
    clearInterval(menuIntervalID); // Halt the previous highlight operation
    currentMenuIndex = 0;
    iconItems.forEach(item => item.classList.remove(HIGHLIGHT_ITEM_STYLE)); // Remove highlight from all previous items

    const visibleGridItems = [...iconItems].filter(gridItem => gridItem.style.display !== "none");
    visibleGridItems[currentMenuIndex].classList.add(HIGHLIGHT_ITEM_STYLE);
    menuIntervalID = setInterval(updateMenuHighlight, highlightDelaySeconds * 1000, visibleGridItems);
}


function highlightGridItems(gridItems, resetIndex=true) {
    clearInterval(intervalID); // Halt the previous highlight operation
    clearInterval(menuIntervalID); // Halt any submenu highlighting
    currentIndex = resetIndex ? 0 : currentIndex;
    gridItems.forEach(item => item.classList.remove(HIGHLIGHT_ITEM_STYLE)); // Remove highlight from all previous items

    const visibleGridItems = [...gridItems].filter(gridItem => gridItem.style.display !== "none");
    visibleGridItems[currentIndex].classList.add(HIGHLIGHT_ITEM_STYLE);
    intervalID = setInterval(updateHighlight, highlightDelaySeconds * 1000, visibleGridItems);
}

function updateHighlight(gridItems) {
    gridItems[currentIndex].classList.remove(HIGHLIGHT_ITEM_STYLE);
    const nextIndex = (currentIndex + 1) % gridItems.length;
    gridItems[nextIndex].classList.add(HIGHLIGHT_ITEM_STYLE);
    currentIndex = nextIndex;
}

function updateMenuHighlight(gridItems) {
    gridItems[currentMenuIndex].classList.remove(HIGHLIGHT_ITEM_STYLE);
    const nextIndex = (currentMenuIndex + 1) % gridItems.length;
    gridItems[nextIndex].classList.add(HIGHLIGHT_ITEM_STYLE);
    currentMenuIndex = nextIndex;
}

function toggleTabVisibility(stationList=undefined) {
    clearInterval(intervalID);
    clearInterval(menuIntervalID);
    if (currentSectionDisplayed === sectionList.CATEGORY) {
        currentSectionDisplayed = sectionList.RADIO;
        categorySection.style.display = "none";
        radioSection.style.display = "block";
        displayRadioStationsInformation(stationList);
        displayRadioStations();
        highlightGridItems(radioItems);
    } else {
        currentSectionDisplayed = sectionList.CATEGORY;
        categorySection.style.display = "block";
        radioSection.style.display = "none";
        displayCategories();
        highlightGridItems(categoryItems);
    }
}

function toggleAudioControlVisibility() {
    const playButton = radioItems[currentIndex].querySelector(".icon-button-container-play");
    const pauseQuitButtons = radioItems[currentIndex].querySelector(".icon-button-container-quit");

    if (radioPlaying) {
        playButton.style.display = "none";
        pauseQuitButtons.style.display = "block";
    } else {
        playButton.style.display = "block";
        pauseQuitButtons.style.display = "none";
    }
}

function toggleRadioControlVisibility(radioItem) {
    let quitPauseButtons = [...radioItem.querySelector(".icon-button-container-quit").children];
    const pauseButton = radioItem.querySelector(".pause");
    const playButton = radioItem.querySelector(".play");

    if (radioPlaying) {
        playButton.style.display = "none";
        pauseButton.style.display = "inline-flex";
    } else {
        playButton.style.display = "inline-flex";
        pauseButton.style.display = "none";
    }
    highlightMenuItems(quitPauseButtons);
}

function setCategoryName(categoryName) {
    categoryNameDiv.innerHTML = `&nbsp<b>${categoryName}<b>`;
}

async function getRadioStationsByCategory() {
    let categoryItem = categoryItems[categoryStartIndex + currentIndex];
    let categoryName = categoryItem.querySelector("p").innerText;
    setCategoryName(categoryName);

    try {
        const stations = await radioBrowserApi.searchStations({
            tagList: [categoryName.toLowerCase()],
            limit: 20,
            offset: 0,
        });

        console.log("Station Retrieved Successfully");

        return stations;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error fetching radio stations');
    }
}
