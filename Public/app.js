// app.js
// JavaScript code goes here
import {RadioBrowserApi, StationSearchType} from 'https://cdn.skypack.dev/radio-browser-api';

let categorySection, radioSection, categoryItems, radioItems, navigationItems;

const sectionList = {CATEGORY: 'category', RADIO: 'radio'};

let currentSectionDisplayed;
let categoryNameDiv;
let intervalID;
let menuHighlightId;

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

/**
 * Represents the index of the settings
 */
let settingsIndex;

let navigationSelected = false;

const HIGHLIGHT_ITEM_STYLE = "highlighted-item";

const radioBrowserApi = new RadioBrowserApi('My Radio App')


document.addEventListener('DOMContentLoaded', function () {
    categoryItems = document.querySelectorAll(".category-item");
    radioItems = document.querySelectorAll(".radio-item");
    categorySection = document.querySelector("#category-tab-section");
    radioSection = document.querySelector("#radio-tab-section");
    navigationItems = document.querySelectorAll(".navigation-icon");
    categoryNameDiv = document.querySelector("#category-name");

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
            // If the navigation tile has already been selected
            if (navigationSelected) {
                handleSKeyPressedNavigation();
            } else {
                // If the current index is 0, the navigation tile is selected
                if (currentIndex === settingsIndex) {
                    clearInterval(intervalID); // Highlight pauses on this item
                    highlightMenuHighlight(navigationItems);
                    navigationSelected = true;
                    // Otherwise a category is selected
                } else {
                    handleSKeyPressedCategory();
                }
            }
        }

        if (currentSectionDisplayed === sectionList.RADIO) {
            handleSKeyPressedRadio();
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

    element = document.getElementById("navigation-item");
    element.style.display = "inline-flex";
}

async function handleSKeyPressedCategory() {
    clearInterval(intervalID);
    await getRadioStationsByCategory().then(stationList => {
        displayRadioStationsInformation(stationList);
        toggleTabVisibility();
        highlightGridItems(radioItems);
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

        navigationItems.forEach(item => item.classList.remove(HIGHLIGHT_ITEM_STYLE));

        displayCategories();
        highlightGridItems(categoryItems);
        navigationSelected = false;
    } else {
        // TODO: display the settings page
    }
}

function displayRadioStationsInformation(stationList) {
    let radioNameElements = document.querySelectorAll(".radio-item-name")
    let radioPlayers = document.querySelectorAll(".radio-audio")

    radioNameElements.forEach((element, index) => {
        let stationName = stationList[index].name;
        element.textContent = stationName;
    });

    radioPlayers.forEach((element, index) => {
        element.src = stationList[index].urlResolved;
    });
}

function highlightMenuHighlight(iconItems) {
    clearInterval(menuHighlightId); // Halt the previous highlight operation
    currentMenuIndex = 0;
    iconItems.forEach(item => item.classList.remove(HIGHLIGHT_ITEM_STYLE)); // Remove highlight from all previous items

    const visibleGridItems = [...iconItems].filter(gridItem => gridItem.style.display !== "none");
    visibleGridItems[currentMenuIndex].classList.add(HIGHLIGHT_ITEM_STYLE);
    menuHighlightId = setInterval(updateMenuHighlight, highlightDelaySeconds * 1000, visibleGridItems);
}


function highlightGridItems(gridItems, resetIndex=true) {
    clearInterval(intervalID); // Halt the previous highlight operation
    clearInterval(menuHighlightId); // Halt any submenu highlighting
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

function toggleTabVisibility() {
    if (currentSectionDisplayed === sectionList.CATEGORY) {
        currentSectionDisplayed = sectionList.RADIO;
        categorySection.style.display = "none";
        radioSection.style.display = "block";
    } else {
        currentSectionDisplayed = sectionList.CATEGORY;
        categorySection.style.display = "block";
        radioSection.style.display = "none";
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
    highlightMenuHighlight(quitPauseButtons);
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
