// app.js
// JavaScript code goes here
import { RadioBrowserApi, StationSearchType } from 'https://cdn.skypack.dev/radio-browser-api';



let categorySection, radioSection, categoryItems, radioItems, settingsSection, settingsItems, stationList, navigationItems;
let sectionList = {CATEGORY: 'category', RADIO: 'radio', SETTINGS: 'settings'};
let currentSectionDisplayed;
let intervalID;
let currentIndex = 0;
let volume, htime, num_stations, num_cat;

let volumeItems, hlightItems, numRadioItems, numCatItems;
let choosingSetting;
let settingIndex;

let radioPlaying = false;
var currentCategoryIndex = 0;
var numCategoriesDisplayed = 8;
var navigationSelected = false;

const radio_api = new RadioBrowserApi('My Radio App')


document.addEventListener('DOMContentLoaded', function () {
    categoryItems = document.querySelectorAll(".category-item");
    radioItems = document.querySelectorAll(".radio-item");
    settingsItems = document.querySelectorAll(".settings-item");
    categorySection = document.querySelector("#category-tab-section");
    radioSection = document.querySelector("#radio-tab-section");
    settingsSection = document.querySelector("#settings-tab-section");
    navigationItems = document.querySelectorAll(".navigation-icon");
    
    // set current tab displayed
    currentSectionDisplayed = sectionList.CATEGORY;
    radioSection.style.display = "none";
    settingsSection.style.display = "none";
    
    // default settings
    //let allSettingsItems = document.querySelectorAll(".settings-value-items");
    volumeItems = document.querySelectorAll("#volume-list div");
    hlightItems = document.querySelectorAll("#highlight-list div");
    numRadioItems = document.querySelectorAll("#num-radio-list div");
    numCatItems = document.querySelectorAll("#num-categories-list div");

    volumeItems[2].classList.add("setting-selected");
    hlightItems[2].classList.add("setting-selected");
    numRadioItems[1].classList.add("setting-selected");
    numCatItems[3].classList.add("setting-selected");

    volume = 50;
    htime = 3
    num_stations = 4;
    num_cat = 9;
    choosingSetting = "none";

    displayCategories();
    
    //starting highlighting process
    highlightGridItems(categoryItems);
});

document.addEventListener('keydown', function(e) {
    const keyPressed = e.key;
    if (keyPressed === "s"){
        if (currentSectionDisplayed === sectionList.CATEGORY) {
            // If the navigation tile has already been selected
            if (navigationSelected) {
                handleSKeyPressedNavigation();
            } else {
                // If the current index is 0, the navigation tile is selected
                if (currentIndex == 0) {
                    clearInterval(intervalID);
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
    for (let index = 0; index < categoryItems.length; index++) {
        var element = categoryItems[index];

        if (currentCategoryIndex <= index && index < currentCategoryIndex + numCategoriesDisplayed) {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    }

    // Displays the navigation item
    var element = document.getElementById("navigation-item");
    element.style.display = "block";
}

async function handleSKeyPressedCategory() {
    stationList = await getRadioStationByCategory();
    loadRadioStation();
    toggleTabVisibility();
    clearInterval(intervalID);
    highlightGridItems(radioItems);
}

async function handleSKeyPressedRadio() {
    let radioPlayer = radioItems[currentIndex-1].querySelector(".radio-audio")

    if (!radioPlaying) {
        clearInterval(intervalID);
        await radioPlayer.play();
        toggleAudioControlVisibility();
        radioPlaying = true;
    } else {
        await radioPlayer.pause();
        toggleAudioControlVisibility();
        highlightGridItems(radioItems);
        radioPlaying = false;
    }
}

// Handles the case when the one of the naviagation buttons is selected
function handleSKeyPressedNavigation() {
    // If current index = 1 the refresh button is highlighted
    if (currentIndex == 1) {
        // Show the next page of categories
        if (currentCategoryIndex + numCategoriesDisplayed > categoryItems.length) {
            currentCategoryIndex = 0;
        } else {
            currentCategoryIndex += numCategoriesDisplayed;
        }

        navigationItems.forEach(item => item.classList.remove("highlight-tab"));
    
        displayCategories();
        clearInterval(intervalID);
        highlightGridItems(categoryItems);
        navigationSelected = false;
    } else {
        // TODO: display the settings page
    }
}

function loadRadioStation() {
    let radioNameElements = document.querySelectorAll(".radio-item-name")
    let radioPlayers = document.querySelectorAll(".radio-audio")
    radioNameElements.forEach((element, index) => {
        element.textContent = stationList[index].name;
    });
    radioPlayers.forEach((element, index) => {
        element.src = stationList[index].urlResolved;
    });
}

function highlightGridItems(gridItems) {
    currentIndex = 0;

    function updateHighlight() {
        gridItems.forEach(item => item.classList.remove("highlight-tab"));
        gridItems[currentIndex].classList.add("highlight-tab");
        
        do {
            currentIndex = (currentIndex + 1) % gridItems.length;
        } while (gridItems[currentIndex].style.display == "none");
    }
   
    updateHighlight();
    intervalID = setInterval(updateHighlight, htime*1000);
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
        console.log("Opening Radio");
    }
    else {
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
        play_section.style.display = "flex";
        pause_quit_section.style.display = "none";
    }
    else {
        play_section.style.display = "none";
        pause_quit_section.style.display = "flex";
    }
}

async function getRadioStationByCategory(){
    let categoryItem = categoryItems[currentIndex - 1];
    let categoryName = categoryItem.querySelector("p").innerText.toLowerCase();

    try {
        const stations = await radio_api.searchStations({
          tagList: [categoryName],
          limit: 20,
          offset: 0,
        });

        console.log("Station Retrieved Successully");
    
        return stations;
      } catch (error) {
        console.error('Error:', error);
        throw new Error('Error fetching radio stations');
      }
}
