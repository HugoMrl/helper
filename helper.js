/*
 * Helpers.JS
 * V1.1
 * 08/12/2020
 * Hugo MORELLE
 *
 * Functions :
 */

export {
  $,
  $$,
  dedupe,
  eventGA,
  getCookie,
  getOffsetTop,
  getParams,
  httpGet,
  isInViewport,
  isOutOfViewport,
  onClickOrTap,
  randomNumber,
  ready,
  round,
  scrollDistance,
  scrollStop,
  setCookie,
  shuffle,
  slugify,
  waitUntil
};

/*
 * Get the first matching element in the DOM
 * @param  {String} selector The element selector
 * @param  {Node}   parent   The parent to search in [optional]
 * @return {Node}            The element
 */
function $(selector, parent) {
  return (parent ? parent : document).querySelector(selector);
};

/*
 * Get an array of all matching elements in the DOM
 * @param  {String} selector The element selector
 * @param  {Node}   parent   The parent to search in [optional]
 * @return {Array}           Th elements
 */
function $$(selector, parent) {
  return Array.prototype.slice.call((parent ? parent : document).querySelectorAll(selector));
};

/*
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */
function shuffle(array) {
  var currentIndex = array.length;
  var temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

/*
 * Remove duplicate items from an array
 * @param  {Array} arr The array
 * @return {Array}     A new array with duplicates removed
 */
function dedupe(arr) {
  return arr.filter(function (item, index) {
    return arr.indexOf(item) === index;
  });
};

/*
 * Send an event to Google Analytics
 * @param {String}  category  The event Category
 * @param {String}  action  The event Action
 * @param {String}  label  The event Label
 * @param {String}  trackerName  The tracker name
 * @param {Boolean}  interactive  The event interactivity, causing bounce or not
 */
function eventGA(category, action, label, trackerName = "", interactive = true) {
  var tracker = trackerName ? trackerName + ".send" : "send";
  var interactivity = interactive ? 1 : 0;
  window[window['GoogleAnalyticsObject']](tracker, 'event', category, action, label, {
    'nonInteraction': interactivity
  });
}

/*
 * Get the value of a cookie
 * @param  {String} name  The name of the cookie
 * @return {String}       The cookie value
 */
function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
};


/*
 * Get an element's distance from the top of the Document.
 * @param  {Node} elem The element
 * @return {Number}    Distance from the top in pixels
 */
function getOffsetTop(elem) {
  var location = 0;
  if (elem.offsetParent) {
    while (elem) {
      location += elem.offsetTop;
      elem = elem.offsetParent;
    }
  }
  return location >= 0 ? location : 0;
};

/*
 * Get the URL parameters
 * @param  {String} url The URL
 * @return {Object}     The URL parameters
 */
function getParams(url) {
  var params = {};
  var parser = document.createElement('a');
  parser.href = url ? url : window.location.href;
  var query = parser.search.substring(1);
  var vars = query.split('&');
  if (vars.length < 1 || vars[0].length < 1) return params;
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return params;
};


/*
 * Make an HTTP GET request
 * @param  {String}  base       The URL end point
 * @param  {String}  params     The request parameters
 * @param  {String}  body       The request body
 * @param  {String}  user       The request user (optional)
 * @param  {String}  password   The request password (optional)
 */
function httpGet(base, params, body = null, user = null, password = null) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    // Si la requête est complète et le retour est OK
    if (this.readyState == 4 && this.status == 200) {
      var response = request.responseText;
      console.log(JSON.parse(response));
      //Do something
    }
  }
  request.open("GET", base + "?" + params, true, user, password); // true pour une requête asynchrone
  if (user != null) {
    request.withCredentials = true
  };
  request.send(body);
};


/*
 * Determine if an element is in the viewport
 * @param  {Node}    elem The element
 * @return {Boolean}      Returns true if element is in the viewport
 */
function isInViewport(elem) {
  var distance = elem.getBoundingClientRect();
  return (
    distance.top >= 0 &&
    distance.left >= 0 &&
    distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    distance.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};


/*
 * Check if an element is out of the viewport
 * @param  {Node}  elem The element to check
 * @return {Object}     A set of booleans for each side of the element
 */
function isOutOfViewport(elem) {
  // Get element's bounding
  var bounding = elem.getBoundingClientRect();
  // Check if it's out of the viewport on each side
  var out = {};
  out.top = bounding.top < 0;
  out.left = bounding.left < 0;
  out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
  out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
  out.any = out.top || out.left || out.bottom || out.right;
  out.all = out.top && out.left && out.bottom && out.right;
  return out;
};


/*
 * Run a callback after a click or tap, without running duplicate callbacks for the same event
 * @param  {Node}   elem       The element to listen for clicks and taps on
 * @param  {Function} callback The callback function to run on a click or tap
 */
function onClickOrTap(elem, callback) {
  // Make sure a callback is provided
  if (!callback || typeof (callback) !== 'function') return;
  // Variables
  var isTouch, startX, startY, distX, distY;
  /**
   * touchstart handler
   * @param  {event} event The touchstart event
   */
  var onTouchStartEvent = function (event) {
    // Disable click event
    isTouch = true;
    // Get the starting location and time when finger first touches surface
    startX = event.changedTouches[0].pageX;
    startY = event.changedTouches[0].pageY;
  };
  /**
   * touchend handler
   * @param  {event} event The touchend event
   */
  var onTouchEndEvent = function (event) {
    // Get the distance travelled and how long it took
    distX = event.changedTouches[0].pageX - startX;
    distY = event.changedTouches[0].pageY - startY;
    // If a swipe happened, do nothing
    if (Math.abs(distX) >= 7 || Math.abs(distY) >= 10) return;
    // Run callback
    callback(event);
  };

  /**
   * click handler
   * @param  {event} event The click event
   */
  var onClickEvent = function (event) {
    // If touch is active, reset and bail
    if (isTouch) {
      isTouch = false;
      return;
    }
    // Run our callback
    callback(event);
  };
  // Event listeners
  elem.addEventListener('touchstart', onTouchStartEvent, false);
  elem.addEventListener('touchend', onTouchEndEvent, false);
  elem.addEventListener('click', onClickEvent, false);
};

/*
 * Get a random integer with a minimum and maximum value
 * @param  {Integer} min  The minimum value
 * @param  {Integer} max  The maximum value
 * @return {Integer}      A random number
 */
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/*
 * Run event after the DOM is ready
 * @param  {Function} fn Callback function
 */
function ready(fn) {
  // Sanity check
  if (typeof fn !== 'function') return;
  // If document is already loaded, run method
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    return fn();
  }
  // Otherwise, wait until document is loaded
  document.addEventListener('DOMContentLoaded', fn, false);
};

/*
 * Round to the nearest whole number
 * @param  {Number|String} num       The numer to round
 * @param  {Number}        precision The whole number to round to (ex. 10, 100, 1000)
 * @param  {String}        method    The rounding method (up, down, or auto - defaults to auto) [optional]
 * @return {String}                  The rounded, delimited number
 */
function round(num, precision, method) {
  // Convert string numbers to a float
  num = parseFloat(num);
  // If there's no rounding precision, return the number
  if (!precision) return num.toLocaleString();
  // Possible methods and their values
  var methods = {
    auto: 'round',
    up: 'ceil',
    down: 'floor'
  };
  // Get the method function
  var fn = methods[method];
  if (!fn) {
    fn = 'round';
  }
  // Do math!
  return (Math[fn](num / precision) * precision).toLocaleString();
};

/*
 * Run a callback after the user scrolls, calculating the distance and direction scrolled
 * @param  {Function} callback The callback function to run
 * @param  {Integer}  refresh  How long to wait between scroll events [optional]
 */
function scrollDistance(callback, refresh) {
  // Make sure a valid callback was provided
  if (!callback || typeof callback !== 'function') return;
  // Variables
  var isScrolling, start, end, distance;
  // Listen for scroll events
  window.addEventListener('scroll', function (event) {
    // Set starting position
    if (!start) {
      start = window.pageYOffset;
    }
    // Clear our timeout throughout the scroll
    window.clearTimeout(isScrolling);
    // Set a timeout to run after scrolling ends
    isScrolling = setTimeout(function () {
      // Calculate distance
      end = window.pageYOffset;
      distance = end - start;
      // Run the callback
      callback(distance, start, end);
      // Reset calculations
      start = null;
      end = null;
      distance = null;
    }, refresh || 66);
  }, false);
};

/*
 * Run a callback function after scrolling has stopped
 * @param  {Function} callback The function to run after scrolling
 */
function scrollStop(callback) {
  // Make sure a valid callback was provided
  if (!callback || typeof callback !== 'function') return;
  // Setup scrolling variable
  var isScrolling;
  // Listen for scroll events
  window.addEventListener('scroll', function (event) {
    // Clear our timeout throughout the scroll
    window.clearTimeout(isScrolling);
    // Set a timeout to run after scrolling ends
    isScrolling = setTimeout(function () {
      // Run the callback
      callback();
    }, 66);
  }, false);
};

/*
 * Set the value of a cookie
 * @param  {String} name  The name of the cookie
 * @param  {String} value  The cookie value
 */
function setCookie(name, value, expirationInSeconds, path = "/") {
  var date = new Date();
  date.setTime(date.getTime() + (expirationInSeconds * 1000));
  date.toGMTString()
  document.cookie = name + "=" + value + "; expires=" + date + "; path=" + path;
};

/*
 * Slugify and remove all diacritics from a string
 * @param {String} string to replace
 * @return {String} string replaced
 */
function slugify(str) {
  var map = {
    '-': ' ',
    '-': '_',
    'a': 'á|à|ã|â|À|Á|Ã|Â',
    'e': 'é|è|ê|É|È|Ê',
    'i': 'í|ì|î|Í|Ì|Î',
    'o': 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
    'u': 'ú|ù|û|ü|Ú|Ù|Û|Ü',
    'c': 'ç|Ç',
    'n': 'ñ|Ñ'
  };
  for (var pattern in map) {
    str = str.replace(new RegExp(map[pattern], 'g'), pattern);
  };
  return str;
};

/*
 * Wait for predicate to return true, then execute success or error
 * @param {Function} predicate function
 * @param {Function} success function
 * @param {Function} error function
 */
function waitUntil(predicate, success, error) {
  var interval = setInterval(function () {
    if (predicate()) {
      clearInterval(interval);
      interval = null;
      success();
    }
  }, 33);
  setTimeout(function () {
    if (interval !== null) {
      clearInterval(interval);
      if (typeof (error) === 'function') {
        error();
      }
    }
  }, 10000);
}
