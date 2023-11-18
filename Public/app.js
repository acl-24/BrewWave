// app.js
// JavaScript code goes here
import { RadioBrowserApi, StationSearchType } from 'https://cdn.skypack.dev/radio-browser-api';

let categorySection, radioSection, categoryItems, radioItems, categoryNavigationItems, radioNavigationItems, stationList;
let sectionList = {CATEGORY: 'category', RADIO: 'radio'};
let currentSectionDisplayed;
let intervalID;
let currentIndex = 0;
let radioPlaying = false;
var currentCategoryIndex = 0;
var numCategoriesDisplayed = 8;
var navigationSelected = false;
var currentRadioIndex = 0;
var numRadiosDisplayed = 5;

const radio_api = new RadioBrowserApi('My Radio App')

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
    categoryNavigationItems = document.querySelectorAll(".category-navigation-icon");
    radioNavigationItems = document.querySelectorAll(".radio-navigation-icon");
    
    // set current tab displayed
    currentSectionDisplayed = sectionList.CATEGORY;
    radioSection.style.display = "none";
    
    //starting highlighting process
    highlightGridItems(categoryItems);
});

document.addEventListener('keydown', function(e) {
    const keyPressed = e.key;
    if (keyPressed === "s"){
        if (currentSectionDisplayed === sectionList.CATEGORY) {
            // If the navigation tile has already been selected
            if (navigationSelected) {
                handleSKeyPressedCategoryNavigation();
            } else {
                // If the current index is 0, the navigation tile is selected
                if (currentIndex == 0) {
                    clearInterval(intervalID);
                    highlightGridItems(categoryNavigationItems);
                    navigationSelected = true;
                // Otherwise a category is selected
                } else {
                    handleSKeyPressedCategory();
                }
            }
        }

        if (currentSectionDisplayed === sectionList.RADIO) {
            // If the navigation tile has already been selected
            if (navigationSelected) {
                handleSKeyPressedRadioNavigation();
            } else {
                // If the current index is 0, the navigation tile is selected
                if (currentIndex == 0) {
                    clearInterval(intervalID);
                    highlightGridItems(radioNavigationItems);
                    navigationSelected = true;
                // Otherwise a radio is selected
                } else {
                    handleSKeyPressedRadio();
                }
            }
        }
    }
})

async function handleSKeyPressedCategory() {
    stationList = await getRadioStationByCategory();
    loadRadioStation(currentRadioIndex);
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

// Handles the selection of the naviagation buttons on the category page
function handleSKeyPressedCategoryNavigation() {
    // If current index = 1 the refresh button is highlighted
    if (currentIndex == 1) {
        // Show the next page of categories
        if (currentCategoryIndex + numCategoriesDisplayed > Object.keys(categoryList).length) {
            currentCategoryIndex = 0;
        } else {
            currentCategoryIndex += numCategoriesDisplayed;
        }
    
        loadCategories(currentCategoryIndex);
        clearInterval(intervalID);
        highlightGridItems(categoryItems);
    } else {
        // TODO: display the settings page
    }

    categoryNavigationItems.forEach(item => item.classList.remove("highlight-tab"));
    navigationSelected = false;
}

// Handles the selection of the naviagation buttons on the stations page
function handleSKeyPressedRadioNavigation() {
    // If current index = 1 the refresh button is highlighted
    if (currentIndex == 1) {
        // Show the next page of radios
        if (currentRadioIndex + numRadiosDisplayed > stationList.length) {
            currentRadioIndex = 0;
        } else {
            currentRadioIndex += numRadiosDisplayed;
        }
    
        loadRadioStation(currentRadioIndex);
        clearInterval(intervalID);
        highlightGridItems(radioItems);
    } else {
        // Load the categories starting with the first page
        currentCategoryIndex = 0;
        loadCategories(currentCategoryIndex);
        clearInterval(intervalID);
        highlightGridItems(categoryItems);
        toggleTabVisibility();
    }

    radioNavigationItems.forEach(item => item.classList.remove("highlight-tab"));
    navigationSelected = false;
}

function loadRadioStation(offset) {
    let radioNameElements = document.querySelectorAll(".radio-item-name")
    let radioPlayers = document.querySelectorAll(".radio-audio")

    // If there number of radio stations to be loaded is less than the number of tiles displayed, hide the extra tiles
    radioItems.forEach((element, index) => {
        if (index + offset < stationList.length) {
            element.style.display = "block";
        } else {
            element.style.display = "none";

            // Displays the navigation item
            var element = document.getElementById("radio-navigation-item");
            element.style.display = "block";
        }
    });

    radioNameElements.forEach((element, index) => {
        if (index + offset < stationList.length) {
            element.textContent = stationList[index + offset].name;
        }
    });
    radioPlayers.forEach((element, index) => {
        if (index + offset < stationList.length) {
            element.src = stationList[index + offset].urlResolved;
        }
    });
}

// Loads the next set of categories
function loadCategories(offset) {
    let categoryNameElements = document.querySelectorAll(".category-item-text")
    let categoryIcons = document.querySelectorAll(".category-icon")

    // If there number of radio stations to be loaded is less than the number of tiles displayed, hide the extra tiles
    categoryItems.forEach((element, index) => {
        if (index + offset < Object.keys(categoryList).length) {
            element.style.display = "block";
        } else {
            element.style.display = "none";

            // Displays the navigation item
            var element = document.getElementById("category-navigation-item");
            element.style.display = "block";
        }
    });

    categoryNameElements.forEach((element, index) => {
        if (index + offset < Object.keys(categoryList).length) {
            element.textContent = Object.keys(categoryList)[index + offset];
        }
    });
    categoryIcons.forEach((element, index) => {
        if (index + offset < Object.keys(categoryList).length) {
            element.src = Object.values(categoryList)[index + offset];
        }
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
    intervalID = setInterval(updateHighlight, 3000);
}

function toggleTabVisibility(){
    if (currentSectionDisplayed === sectionList.CATEGORY) {
        currentSectionDisplayed = sectionList.RADIO;
        categorySection.style.display = "none";
        radioSection.style.display = "block";
    }
    else {
        currentSectionDisplayed = sectionList.CATEGORY;
        categorySection.style.display = "block";
        radioSection.style.display = "none";
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
