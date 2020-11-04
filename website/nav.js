'use strict';

const dropdownElement = document.getElementById('phone-dropdown');
const mainNavElement = document.getElementById('main-nav');

function displayMenu() {
    dropdownElement.classList.toggle('show-nav');
}

function closeMenu() {
    if (dropdownElement.classList.contains('show-nav')) {
        dropdownElement.classList.remove('show-nav');
    }
}

window.onclick = function(event) {
    if (!mainNavElement.contains(event.target) ||
        event.target.matches('.menu-item')) {
        closeMenu();
    }
}
