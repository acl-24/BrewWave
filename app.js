// app.js
// JavaScript code goes here

document.addEventListener('DOMContentLoaded', function () {
    const categoryItems = document.querySelectorAll(".category-item");
    highlightGridItems(categoryItems);}
);


function highlightGridItems(gridItems) {
    let currentIndex = 0;

    function updateHighlight() {
        gridItems.forEach(item => item.classList.remove("highlight"));
        gridItems[currentIndex].classList.add("highlight");
        currentIndex = (currentIndex + 1) % gridItems.length;
    }

    updateHighlight();
    setInterval(updateHighlight, 3000);
}

