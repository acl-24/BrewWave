// app.js
// JavaScript code goes here
import { RadioBrowserApi, StationSearchType } from 'https://cdn.skypack.dev/radio-browser-api';

let categorySection, radioSection, categoryItems, radioItems, settingsSection, settingsItems, stationList;
let sectionList = {CATEGORY: 'category', RADIO: 'radio', SETTINGS: 'settings'};
let currentSectionDisplayed;
let intervalID;
let currentIndex = 0;
let previousTabDisplayed;
let volume, htime, num_stations, num_cat;

let volumeItems, hlightItems, numRadioItems, numCatItems;
let choosingSetting;

let radioPlaying = false;

const radio_api = new RadioBrowserApi('My Radio App')


document.addEventListener('DOMContentLoaded', function () {
    categoryItems = document.querySelectorAll(".category-item");
    radioItems = document.querySelectorAll(".radio-item");
    settingsItems = document.querySelectorAll(".settings-item");
    categorySection = document.querySelector("#category-tab-section");
    radioSection = document.querySelector("#radio-tab-section");
    settingsSection = document.querySelector("#settings-tab-section");
    
    // set current tab displayed
    currentSectionDisplayed = sectionList.CATEGORY;
    radioSection.style.display = "none";
    settingsSection.style.display = "none";
    
    // default settings
    //let allSettingsItems = document.querySelectorAll(".settings-value-items");
    volumeItems = document.querySelectorAll("#volume-list div");
    hlightItems = document.querySelectorAll("#highlight-list div");
    numRadioItems = document.querySelectorAll("#num-radio-list div");
    numCatItems = document.querySelectorAll("#num-cat-list div");

    volume = 50;
    htime = 3
    num_stations = 4;
    num_cat = 9;
    choosingSetting = "none";
    
    //starting highlighting process
    highlightGridItems(categoryItems);
});

document.addEventListener('keydown', function(e) {
    const keyPressed = e.key;
    if (keyPressed === "s"){
        if (currentSectionDisplayed === sectionList.CATEGORY) {
            handleSKeyPressedCategory();
        }

        if (currentSectionDisplayed === sectionList.RADIO) {
            handleSKeyPressedRadio();
        }
    }

    if (keyPressed === "a"){
        handleKeyPressedSettings();
    }
})

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
        radioPlayer.play();
        highlightGridItems(categoryItems);
        radioPlaying = true;
    } else {
        radioPlayer.pause();
        currentIndex = 0;
        highlightGridItems(radioItems);
        radioPlaying = false;
    }

    toggleAudioControlVisibility();
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
        currentIndex = (currentIndex + 1) % gridItems.length;
    }
   
    updateHighlight();
    intervalID = setInterval(updateHighlight, 3000);
}

// used to navigate between category and settings
function handleKeyPressedSettings() {
    if (currentSectionDisplayed === sectionList.SETTINGS && choosingSetting === "none") {
        choosingSetting = true;
        let settingIndex = currentIndex;
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
            settingsSection.style.display = "none";
            categorySection.style.display = "block";
            clearInterval(intervalID);
            highlightGridItems(categoryItems);
            choosingSetting = "none"
        }
    }
    else if (choosingSetting !== "none") {
        /*
        let index = currentIndex;
        console.log(index);
        let i = choosingSetting[index-1];
        console.log(i.textContent);
        */
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
        previousTabDisplayed = sectionList.CATEGORY;
        currentSectionDisplayed = sectionList.SETTINGS;
        categorySection.style.display = "none";
        settingsSection.style.display = "block";
        clearInterval(intervalID);
        highlightGridItems(settingsItems);
        console.log("Opening Settings");
    }
    else if (currentSectionDisplayed === sectionList.RADIO) {
        previousTabDisplayed = sectionList.RADIO;
        currentSectionDisplayed = sectionList.SETTINGS;
        settingsSection.style.display = "block";
        radioSection.style.display = "none";
        clearInterval(intervalID);
        highlightGridItems(settingsItems);
        console.log("Opening Settings");
    }
    else {        
        currentSectionDisplayed = previousTabDisplayed;
        settingsSection.style.display = "none";
        
        if (currentSectionDisplayed === sectionList.CATEGORY) {
            categorySection.style.display = "block";
            clearInterval(intervalID);
            highlightGridItems(categoryItems);
        }
        else {
            radioSection.style.display = "block";
            clearInterval(intervalID);
            highlightGridItems(radioItems);
        }
    }
}


function toggleAudioControlVisibility(){
    const play_section = radioItems[currentIndex-1].querySelector(".icon-button-container-play");
    const pause_quit_section = radioItems[currentIndex-1].querySelector(".icon-button-container-quit");
    if (radioPlaying) {
        play_section.style.display = "none";
        pause_quit_section.style.display = "flex";
    }
    else {
        play_section.style.display = "flex";
        pause_quit_section.style.display = "none";
    }
}

async function getRadioStationByCategory(){
    let categoryItem = categoryItems[currentIndex];
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
