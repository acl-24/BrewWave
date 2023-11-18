// app.js
// JavaScript code goes here
import {RadioBrowserApi, StationSearchType} from 'https://cdn.skypack.dev/radio-browser-api';

let categorySection, radioSection, categoryItems, radioItems, settingsSection, settingsItems, stationList, navigationItems;
let sectionList = {CATEGORY: 'category', RADIO: 'radio', SETTINGS: 'settings'};
let currentSectionDisplayed;
let categoryNameDiv;
let intervalID;

let volume, htime, num_stations, num_cat;

let volumeItems, hlightItems, numRadioItems, numCatItems;
let choosingSetting;
let settingIndex;

var currentCategoryIndex = 0;
var numCategoriesDisplayed = 8;
var navigationSelected = false;

/**
 * Represents the length that a certain station is highlighted
 * @type {number}
 */
const HIGHLIGHT_DELAY_SECONDS = 3;

let currentIndex = 0;

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
    settingsItems = document.querySelectorAll(".settings-item");
    categorySection = document.querySelector("#category-tab-section");
    radioSection = document.querySelector("#radio-tab-section");
    settingsSection = document.querySelector("#settings-tab-section");
    navigationItems = document.querySelectorAll(".navigation-icon");
    categoryNameDiv = document.querySelector("#category-name");

    // set current tab displayed
    currentSectionDisplayed = sectionList.CATEGORY;
    radioSection.style.display = "none";
    settingsSection.style.display = "none";
    
    // default settings
    volumeItems = document.querySelectorAll("#volume-list div");
    hlightItems = document.querySelectorAll("#highlight-list div");
    numRadioItems = document.querySelectorAll("#num-radio-list div");
    numCatItems = document.querySelectorAll("#num-categories-list div");

    volumeItems[2].classList.add("setting-selected");
    hlightItems[2].classList.add("setting-selected");
    numRadioItems[1].classList.add("setting-selected");
    numCatItems[3].classList.add("setting-selected");

    volume = 0.5;
    htime = 3
    num_stations = 4;
    num_cat = 9;
    choosingSetting = "none";

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
                    highlightGridItems(navigationItems);
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

    if (keyPressed === "a"){
        handleKeyPressedSettings();
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

async function handleSKeyPressedRadio() {
    let radioPlayer = radioItems[currentIndex].querySelector(".radio-audio")
    radioPlayer.volume = volume;

    if (!radioPlaying) {
        clearInterval(intervalID); // Highlight pauses on this item
        await radioPlayer.play();
        radioPlaying = true;
        toggleAudioControlVisibility();
    } else {
        radioPlayer.pause();
        radioPlaying = false;
        toggleAudioControlVisibility();
        highlightGridItems(radioItems, false);
    }
}

// Handles the case when the one of the navigation buttons is pressed
function handleSKeyPressedNavigation() {
    if (currentIndex ===  0) { // Refresh button
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
        element.textContent = stationList[index].name;
    });

    radioPlayers.forEach((element, index) => {
        element.src = stationList[index].urlResolved;
    });
}

function highlightGridItems(gridItems, resetIndex=true) {
    clearInterval(intervalID); // Halt the previous highlight operation
    currentIndex = resetIndex ? 0 : currentIndex;
    gridItems.forEach(item => item.classList.remove(HIGHLIGHT_ITEM_STYLE)); // Remove highlight from all previous items

    const visibleGridItems = [...gridItems].filter(gridItem => gridItem.style.display !== "none");
    gridItems[currentIndex].classList.add(HIGHLIGHT_ITEM_STYLE);
    intervalID = setInterval(updateHighlight, HIGHLIGHT_DELAY_SECONDS * 1000, visibleGridItems);
}

function updateHighlight(gridItems) {
    gridItems[currentIndex].classList.remove(HIGHLIGHT_ITEM_STYLE);
    const nextIndex = (currentIndex + 1) % gridItems.length;
    gridItems[nextIndex].classList.add(HIGHLIGHT_ITEM_STYLE);
    currentIndex = nextIndex;
}

// used to navigate between category and settings
function handleKeyPressedSettings() {
    if (currentSectionDisplayed === sectionList.SETTINGS && choosingSetting === "none") {
        choosingSetting = true;
        settingIndex = currentIndex;
        console.log(settingIndex);
        clearInterval(intervalID);
    
        if (settingIndex == 1) {
            highlightGridItems(volumeItems);
            choosingSetting =  volumeItems;
        }
        else if (settingIndex == 2) {
            highlightGridItems(hlightItems);
            choosingSetting = hlightItems;
        }
        else if (settingIndex == 3) {
            highlightGridItems(numRadioItems);
            choosingSetting = numRadioItems;
        }
        else if (settingIndex ==4) {
            highlightGridItems(numCatItems);
            choosingSetting = numCatItems;
        }
        else {
            // navigate back to category screen
            currentSectionDisplayed = sectionList.CATEGORY;
            settingsSection.style.display = "none";
            categorySection.style.display = "block";
            clearInterval(intervalID);
            highlightGridItems(categoryItems);
            choosingSetting = "none"
        }

        choosingSetting.forEach(item => item.classList.remove("setting-selected"));
    }
    else if (currentSectionDisplayed === sectionList.SETTINGS && choosingSetting !== "none") {
        let index = currentIndex;
        let setting_value;
        choosingSetting.forEach(item => item.classList.remove("highlight-tab"));

        if (index == 0) {
            setting_value = choosingSetting[4];
            choosingSetting[4].classList.add("setting-selected");
        }
        else {
            setting_value = choosingSetting[index-1];
            choosingSetting[index-1].classList.add("setting-selected");
        }
    
        if (choosingSetting === volumeItems) {
            volume = setting_value.dataset.value;
        }
        else if (choosingSetting === hlightItems) {
            htime = setting_value.dataset.value;
        }
        else if (choosingSetting === numRadioItems) {
            num_stations = setting_value.dataset.value;
        }
        else if (choosingSetting === numCatItems) {
            num_cat = setting_value.dataset.value;
        }

        console.log("Settings:", "V", volume, "H", htime, "#S", num_stations, "#C", num_cat);

        clearInterval(intervalID);
        highlightGridItems(settingsItems);
        choosingSetting = "none"
        
    }
    else {
        toggleSettingsVisibility();
    }
    
}


function toggleTabVisibility(){
    if (currentSectionDisplayed === sectionList.CATEGORY) {
        currentSectionDisplayed = sectionList.RADIO;
        categorySection.style.display = "none";
        radioSection.style.display = "block";
    } else {
        currentSectionDisplayed = sectionList.CATEGORY;
        categorySection.style.display = "block";
        console.log("Opening Category");
    }
}

// used to navigate to/from settings tab
function toggleSettingsVisibility(){
    if (currentSectionDisplayed === sectionList.CATEGORY) {
        currentSectionDisplayed = sectionList.SETTINGS;
        categorySection.style.display = "none";
        settingsSection.style.display = "block";
        clearInterval(intervalID);
        highlightGridItems(settingsItems);
        console.log("Opening Settings");
    }
    else {        
        currentSectionDisplayed = sectionList.CATEGORY;
        categorySection.style.display = "block"
        settingsSection.style.display = "none";
        clearInterval(intervalID);
        highlightGridItems(settingsItems);
        console.log("Opening Category");
    }
}


function toggleAudioControlVisibility(){
    const play_section = radioItems[currentIndex-1].querySelector(".icon-button-container-play");
    const pause_quit_section = radioItems[currentIndex-1].querySelector(".icon-button-container-quit");
    if (radioPlaying) {
        play_section.style.display = "none";
        pause_quit_section.style.display = "block";
    } else {
        play_section.style.display = "block";
        pause_quit_section.style.display = "none";
    }
}

function setCategoryName(categoryName) {
    categoryNameDiv.innerHTML = `&nbsp<b>${categoryName}<b>`;
}

async function getRadioStationsByCategory() {
    let categoryItem = categoryItems[currentIndex];
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
