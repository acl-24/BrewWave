// app.js
// JavaScript code goes here
import { RadioBrowserApi, StationSearchType } from 'https://cdn.skypack.dev/radio-browser-api';

let categorySection, radioSection, categoryItems, radioItems, settingsSection, settingsItems;
let sectionList = {CATEGORY: 'category', RADIO: 'radio', SETTINGS: 'settings'};
let currentSectionDisplayed;
let currentIndex = 0;
let previousTabDisplayed;
let settingsList = {VOLUME: 'volume', HTIME : 'htime', NUMRADIO: 'numradio', NUMCAT: 'numcat'};

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
    
    
    //starting highlighting process
    highlightGridItems(categoryItems);
});

document.addEventListener('keydown', function(e) {
    const keyPressed = e.key;
    if (keyPressed === "s"){
        if (currentSectionDisplayed === sectionList.CATEGORY) {
            handleSKeyPressed();
        }
    }

    if (keyPressed === "a"){
        toggleSettingsVisibility();
        
    }
})

async function handleSKeyPressed() {
    await getRadioStationByCategory();
    toggleTabVisibility();
}

function highlightGridItems(gridItems) {
    currentIndex = 0;

    function updateHighlight() {
        gridItems.forEach(item => item.classList.remove("highlight"));
        gridItems[currentIndex].classList.add("highlight");
        currentIndex = (currentIndex + 1) % gridItems.length;
    }

    updateHighlight();
    setInterval(updateHighlight, 3000);
}

// used to navigate between category and settings
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
        console.log("Opening Settings");
    }
    else if (currentSectionDisplayed === sectionList.RADIO) {
        previousTabDisplayed = sectionList.RADIO;
        currentSectionDisplayed = sectionList.SETTINGS;
        settingsSection.style.display = "block";
        radioSection.style.display = "none";
        console.log("Opening Settings");
    }
    else {        
        currentSectionDisplayed = previousTabDisplayed;
        settingsSection.style.display = "none";
        
        if (currentSectionDisplayed === sectionList.CATEGORY) {
            categorySection.style.display = "block";
        }
        else {
            radioSection.style.display = "block";
        }
    }
}


async function getRadioStationByCategory(){
    let categoryItem = categoryItems[currentIndex];
    let categoryName = categoryItem.querySelector("p").innerText.toLowerCase();

    try {
        const stations = await radio_api.searchStations({
          tagList: [categoryName],
          limit: 100,
          offset: 0,
        });

        console.log("Station Retrieved Successully");
    
        return stations;
      } catch (error) {
        console.error('Error:', error);
        throw new Error('Error fetching radio stations');
      }
}

async function getSettings(){
    let settingsItem = settingsItems[currentIndex];
    let settingsName = settingsItem.querySelector("p").innerText.toLowerCase();

    /*
    try {
        const response = await fetch(`http://localhost:3000/api/radio?category=${encodeURIComponent(settingsName)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); 
    } catch (error) {
        console.error('Error:', error);
    } */
}
