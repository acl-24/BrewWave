// app.js
// JavaScript code goes here
let categorySection, radioSection, categoryItems, radioItems;
let sectionList = {CATEGORY: 'category', RADIO: 'radio'};
let currentSectionDisplayed;
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', function () {
    categoryItems = document.querySelectorAll(".category-item");
    radioItems = document.querySelectorAll(".radio-item");
    categorySection = document.querySelector("#category-tab-section");
    radioSection = document.querySelector("#radio-tab-section");
    
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
            getRadioStationByCategory();
            toggleTabVisibility();
        }
    }
})

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

async function getRadioStationByCategory(){
    let categoryItem = categoryItems[currentIndex];
    let categoryName = categoryItem.querySelector("p").innerText.toLowerCase();

    try {
        const response = await fetch(`http://localhost:3000/api/radio?category=${encodeURIComponent(categoryName)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); 
    } catch (error) {
        console.error('Error:', error);
    }
}
