// ==UserScript==
// @name         SieSmart localhost css
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Inject css to SieSmart localhost
// @author       You
// @match        http://localhost:8080/frontend/*
// @match        http://localhost:8080/report/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const css = `
ul#prim-menu {
  padding: 8px;
}

ul#prim-menu li {
  padding: 4px 0;
}

ul#prim-menu li a {
  color: #548c80 !important;
}

div#toolbar {
  height: auto;
  background-color: #c4da47 !important;
}

#stage-header-text {
  visibility: visible;
}

ul#menu li:not(.quick-search):not(.country-sel) {
  padding: 8px;
}

ul#menu li a {
  font-size: 12px;
  color: #548c80;
}

div#content {
  float: left !important;
  margin: 0 !important;
}
`;

    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));

    document.body.appendChild(style);

    const stageHeaderText = document.getElementById('stage-header-text');
    if (stageHeaderText) {
        stageHeaderText.innerHTML = 'localhost';
    }
})();