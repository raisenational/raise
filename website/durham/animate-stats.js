'use strict';

$('.ui.accordion')
  .accordion()
;

function displayMenu() {
    document.getElementById('phone-dropdown').classList.toggle('show-nav');
}

window.onclick = function(event) {
    if (!event.target.matches('.main-nav-menu-button')) {
        var dropdowns = document.getElementById("phone-dropdown");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show-nav')) {
            openDropdown.classList.remove('show-nav');
        }
        }
    }
}

// https://gist.github.com/gre/1650294
const easingFunctions = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity
    easeInQuart: function (t) { return t*t*t*t },
    // decelerating to zero velocity
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}


function animateNumber(element, startValue, endValue, formatter, durationMs, easingFunction) {
    const startTime = Date.now();

    const displayValue = (unformattedValue) => {
        const formattedValue = formatter(unformattedValue);

        element.textContent = formattedValue;
    };

    const animate = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        const easedValue = ease(startValue, endValue, durationMs, elapsedTime, easingFunction);
        displayValue(easedValue);

        if(elapsedTime < durationMs) {
            window.requestAnimationFrame(animate);
        } else {
            //make sure the final value is rendered
            displayValue(endValue);
        }
    }

    animate();
}

function ease(startValue, endValue, duration, elapsedTime, easingFunction) {
    // Make sure the animation doesn't glitch if we pass values outside the range of the easing function by clamping to 0 or 1.
    if(elapsedTime >= duration) {
        return 1;
    }
    if(elapsedTime <= 0) {
        return 0;
    }

    const proportionThroughAnimation = elapsedTime / duration;
    const normalisedEase = easingFunction(proportionThroughAnimation);
    return startValue + (endValue - startValue) * normalisedEase;
}

function standardIntegerFormatter(value) {
    return value.toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 0 });
}

function integerPoundsFormatter(value) {
    return "\u00A3" + value.toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 0 });
}

const yearsElement = document.getElementById('years-number');
animateNumber(yearsElement, 0, 1, standardIntegerFormatter, 1000, easingFunctions.linear);
const studentsElement = document.getElementById('students-number');
animateNumber(studentsElement, 0, 125, standardIntegerFormatter, 2000, easingFunctions.linear);
const raisedElement = document.getElementById('raised-number');
animateNumber(raisedElement, 0, 26820, integerPoundsFormatter, 3000, easingFunctions.linear);
const peopleProtectedElement = document.getElementById('people-protected-number');
animateNumber(peopleProtectedElement, 0, 32964, standardIntegerFormatter, 4000, easingFunctions.linear);
