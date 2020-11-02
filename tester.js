
/*
* tester.js
* V1.0
* 02/11/2020
* Hugo MORELLE
Functions :
addCSS()
removeElement()

*/

/*
 * Insert/replace CSS in the DOM
 * @param  {String}   content The css content
 * @param  {String}   id      The id of the injected style
 */
var addCSS = function (content, id){
  var styleSheet = document.createElement("style");
  if(id){
    styleSheet.id = id;
    if (document.querySelector(`style#${id}`) !== null) { 
      removeElement(`style#${id}`) 
    }
  }
  styleSheet.innerText = content;
  document.head.appendChild(styleSheet);
}

/*
 * Remove element from the DOM
 * @param  {String} selector The element selector
 */
var removeElement = function (selector) {
  document.querySelector(selector).parentElement.removeChild(document.querySelector(selector))
}
