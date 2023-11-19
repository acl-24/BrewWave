// app.js
// JavaScript code goes here
import {RadioBrowserApi} from 'https://cdn.skypack.dev/radio-browser-api';

let categorySection, radioSection, categoryItems, radioItems, categoryNavigationItems, radioNavigationItems,
    settingsSection, settingsItems, volumeItems, highlightItems, categoryNameDiv;

const sectionList = {CATEGORY: 'category', RADIO: 'radio', SETTINGS: 'settings'};
let currentSectionDisplayed;

let lastKeyPressTime = 0;

/**
 * Interval ID used when starting interval highlighting grid items
 */
let intervalID;

/**
 * Interval ID used when starting highlighting within menus
 */
let menuIntervalID;

/**
 * Represents a list of stations returned by the `radioBrowserAPI`
 */
let stationList;

/**
 * Represents if we are currently selecting a setting option
 * @type {boolean}
 */
let choosingSetting = false;

/**
 * Represents the volume percent for all radios
 * @type {number}
 */
let volumePercent = 0.5;

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
let debounceTime = highlightDelaySeconds * 1000;


/**
 * Represents the index of the settings within the radio and category pages, set when we refresh the pages
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
    "Chillout": "/Assets/wind.png",
    "Christmas": "/Assets/wreath.png",
    "Classical": "/Assets/viola.png",
    "Country": "/Assets/guitar.png",
    "EDM": "/Assets/birthday-and-party.png",
    "Folk": "/Assets/vinyl-disc.png",
    "Hip-Hop": "/Assets/hip-hop.png",
    "International": "/Assets/earth.png",
    "Jazz": "/Assets/saxophone.png",
    "Kids": "/Assets/tambourine.png",
    "News": "/Assets/newspaper.png",
    "Oldies": "/Assets/sixties.png",
    "Pop": "/Assets/microphone.png",
    "Rock": "/Assets/electric-guitar.png",
    "Soul": "/Assets/voice-mail.png",
    "Sports": "/Assets/sports.png",
    "Talk": "/Assets/podcast.png",
    "Top 40": "/Assets/40.png"
};

let station_tags_dictionary={ 
    "All": [""],
    "70s": "70s",
    "80s": "80s", 
    "90s": "90s",
    "Alternative": "alternative",
    "Chillout": "chillout",
    "Christmas": "christmas music",
    "Classical": "classical",
    "Country": "country",
    "EDM": "edm",
    "Folk": "folk",
    "Hip-Hop": "hiphop",
    "International": "international",
    "Jazz": "jazz",
    "Kids": "kids",
    "News": "news",
    "Oldies": "oldies",
    "Pop": "pop",
    "Rock": "rock",
    "Soul": "soul",
    "Sports": "sports",
    "Talk": "talk",
    "Top 40": "top 40"
};

document.addEventListener('DOMContentLoaded', function () {
    categoryItems = document.querySelectorAll(".category-item");
    radioItems = document.querySelectorAll(".radio-item");
    settingsItems = document.querySelectorAll(".settings-item");
    categorySection = document.querySelector("#category-tab-section");
    radioSection = document.querySelector("#radio-tab-section");
    settingsSection = document.querySelector("#settings-tab-section");
    categoryNameDiv = document.querySelector("#category-name");
    categoryNavigationItems = document.querySelectorAll(".category-navigation-icon");
    radioNavigationItems = document.querySelectorAll(".radio-navigation-icon");

    // set current tab displayed
    currentSectionDisplayed = sectionList.CATEGORY;
    radioSection.style.display = "none";
    settingsSection.style.display = "none";
    
    // default settings
    volumeItems = document.querySelectorAll("#volume-list div");
    highlightItems = document.querySelectorAll("#highlight-list div");

    volumeItems[2].classList.add("setting-selected");
    highlightItems[0].classList.add("setting-selected");

    displayCategories();

    //starting highlighting process
    highlightGridItems(categoryItems);
});

document.addEventListener('keydown', function (e) {
    const currentTime = new Date().getTime();
    if (currentTime - lastKeyPressTime > debounceTime) {
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

            else if (currentSectionDisplayed === sectionList.RADIO) {
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

            else if (currentSectionDisplayed === sectionList.SETTINGS) {
                handleSKeyPressedSettings();
            }
        }
        lastKeyPressTime = currentTime;
    }
})

function numCategories() {
    return Object.keys(categoryList).length;
}

// Displays the next set of categories
function displayCategories() {
    let categoryNameElements = document.querySelectorAll(".category-item-text")
    let categoryIcons = document.querySelectorAll(".category-icon")
    for (let index = categoryStartIndex; index < numCategories() && index < categoryStartIndex + numCategoriesDisplayed; index++) {
        categoryItems[index % numCategoriesDisplayed].style.display = "inline-flex";
        categoryNameElements[index % numCategoriesDisplayed].textContent = Object.keys(categoryList)[index];
        categoryIcons[index % numCategoriesDisplayed].src = Object.values(categoryList)[index];
    }

    settingsIndex = Math.min(numCategoriesDisplayed, numCategories() - categoryStartIndex);
    for (let index = settingsIndex; index < numCategoriesDisplayed; index++) {
        // Hide items which have no category name
        categoryItems[index].style.display = "none";
    }

    let element = document.getElementById("category-navigation-item");
    element.style.display = "inline-flex";
}

// Displays the next set of radios
function displayRadioStations() {
    let radioNameElements = document.querySelectorAll(".radio-item-name");
    let radioPlayers = document.querySelectorAll(".radio-audio");


    for (let index = radioStartIndex; index < stationList.length && index < radioStartIndex + numRadiosDisplayed; index++) {
        radioItems[index % numRadiosDisplayed].style.display = "inline-flex";
        radioNameElements[index % numRadiosDisplayed].textContent = stationList[index].name;
        radioPlayers[index % numRadiosDisplayed].src = stationList[index].urlResolved;
    }

    settingsIndex = Math.min(numRadiosDisplayed, stationList.length - radioStartIndex);
    for (let index = settingsIndex; index < numRadiosDisplayed; index++) {
        // Hide items which have no category name
        radioItems[index].style.display = "none";
    }
}

async function handleSKeyPressedCategory() {
    clearInterval(intervalID);
    radioStartIndex = 0;
    await getRadioStationsByCategory().then(sl => {
        stationList = sl;
        toggleTabVisibility();
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
    radioPlayer.volume = volumePercent;

    if (!radioPlaying) {
        try {
            await radioPlayer.play();
            clearInterval(intervalID); // Highlight pauses on this item
        } catch (e) {
            return;
        }
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
        if (categoryStartIndex + numCategoriesDisplayed > numCategories()) {
            categoryStartIndex = 0;
        } else {
            categoryStartIndex += numCategoriesDisplayed;
        }

        displayCategories();
        highlightGridItems(categoryItems);

    } else {
        // Opens settings
        currentSectionDisplayed = sectionList.SETTINGS;
        categorySection.style.display = "none";
        settingsSection.style.display = "block";
        clearInterval(intervalID);
        highlightGridItems(settingsItems);
    }
    navigationSelected = false;
    categoryNavigationItems.forEach(item => item.classList.remove(HIGHLIGHT_ITEM_STYLE));
}

// Handles the selection of the navigation buttons on the category page
function handleSKeyPressedRadioNavigation() {
    if (currentMenuIndex === 0) { // refresh button
        // Show the next page of radios
        if (radioStartIndex + numCategoriesDisplayed > stationList.length) {
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

// used to navigate between category and settings
function handleSKeyPressedSettings() {
    if (!choosingSetting) {
        clearInterval(intervalID); // Pause on this setting
        choosingSetting = true;
        if (currentIndex === 0) {
            highlightMenuItems(volumeItems);
            volumeItems.forEach(item => item.classList.remove("setting-selected"));
        }
        else if (currentIndex === 1) {
            highlightMenuItems(highlightItems);
            highlightItems.forEach(item => item.classList.remove("setting-selected"));
        }
        else { // back button
            currentSectionDisplayed = sectionList.CATEGORY;
            settingsSection.style.display = "none";
            categorySection.style.display = "block";
            choosingSetting = false;
            clearInterval(intervalID);
            highlightGridItems(categoryItems);
            displayCategories();
        }
    }
    else if (choosingSetting) {
        // choosingSetting.forEach(item => item.classList.remove("highlight-tab"));
        const settingValue = currentIndex === 0 ? volumeItems[currentMenuIndex] : highlightItems[currentMenuIndex];
        settingValue.classList.add("setting-selected");
    
        if (currentIndex === 0) {
            volumePercent = Number(settingValue.dataset.value);
        } else if (currentIndex === 1) {
            highlightDelaySeconds = Number(settingValue.dataset.value);
            debounceTime = highlightDelaySeconds * 1000;
        }

        volumeItems.forEach(item => item.classList.remove(HIGHLIGHT_ITEM_STYLE));
        highlightItems.forEach(item => item.classList.remove(HIGHLIGHT_ITEM_STYLE));

        highlightGridItems(settingsItems, false);
        choosingSetting = false;
    }
}


function updateMenuHighlight(gridItems) {
    gridItems[currentMenuIndex].classList.remove(HIGHLIGHT_ITEM_STYLE);
    const nextIndex = (currentMenuIndex + 1) % gridItems.length;
    gridItems[nextIndex].classList.add(HIGHLIGHT_ITEM_STYLE);
    currentMenuIndex = nextIndex;
}

function toggleTabVisibility() {
    clearInterval(intervalID);
    clearInterval(menuIntervalID);
    if (currentSectionDisplayed === sectionList.CATEGORY) {
        currentSectionDisplayed = sectionList.RADIO;
        categorySection.style.display = "none";
        radioSection.style.display = "block";
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
    highlightMenuItems(quitPauseButtons, false);
}

function setCategoryName(categoryName) {
    categoryNameDiv.innerHTML = `&nbsp<b>${categoryName}<b>`;
}

async function getRadioStationsByCategory() {
    let categoryName = Object.keys(categoryList)[currentIndex + categoryStartIndex];
    let categoryTag = station_tags_dictionary[categoryName];
    
    setCategoryName(categoryName);

    try {
        const stations = await radioBrowserApi.searchStations({
            tagList: [categoryTag],
            language: "english",
            limit: 20,
            offset: 0,
            order: "votes",
            reverse: true
        });

        console.log(stations);

        console.log("Station Retrieved Successfully");

        return stations;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error fetching radio stations');
    }
}
