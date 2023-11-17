// app.js
// JavaScript code goes here
var currentCategoryIndex = 0;
var numCategoriesDisplayed = 8;

document.addEventListener('DOMContentLoaded', function () {
    categoryItems = document.querySelectorAll(".category-item");

    displayCategories();
});

// Displays the next set of items ba
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

document.addEventListener('keydown', function(e) {
    const keyPressed = e.key;

    // TODO: replace this once highlight is working
    // Currently when the 'n' key is pressed the next page of categories is shown
    if (keyPressed == "n") {
        if (currentCategoryIndex + numCategoriesDisplayed > categoryItems.length) {
            currentCategoryIndex = 0;
        } else {
            currentCategoryIndex += numCategoriesDisplayed;
        }

        displayCategories();
    }
})