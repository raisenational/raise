'use strict';

// TOOD: why is this here?
$('.ui.accordion')
  .accordion()
;

// TOOD: why is this not in nav.js
function displayMenu() {
    document.getElementById('phone-dropdown').classList.toggle('show-nav');
}

// TOOD: why is this not in nav.js
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

// TODO: we always use linear anyways - is this necessary?
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

function animateNumber(element, startValue, durationMs, easingFunction = easingFunctions.linear) {
    if (!/^£?\d[,\d]*$/.test(element.innerText)) {
        console.error('Invalid value \'' + element.innerText + '\' found for animated element', element);
        return;
    }

    const formatter = element.innerText.includes('£') ? integerPoundsFormatter : standardIntegerFormatter;
    const endValue = parseInt(element.innerText.replace(/\D/g, ''));
    
    const displayValue = (unformattedValue) => {
        const formattedValue = formatter(unformattedValue);
        element.textContent = formattedValue;
    };
    
    const animate = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        if (elapsedTime < durationMs) {
            const easedValue = ease(startValue, endValue, durationMs, elapsedTime, easingFunction);
            displayValue(easedValue);
            window.requestAnimationFrame(animate);
        } else {
            //make sure the final value is rendered
            displayValue(endValue);
        }
    }

    const startTime = Date.now();
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
    return "£" + standardIntegerFormatter(value);
}

const elements = document.getElementsByClassName('stats-animate');
for (let i = 0; i < elements.length; i++) {
    animateNumber(elements[i], 0, (i + 1) * 1000);
}
