// ==UserScript==
// @name         SieSmart localhost auto login
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically login on SieSmart localhost
// @author       You
// @match        http://localhost:8080/frontend/*
// @match        http://localhost:8080/report/*
// @grant        none
// ==/UserScript==

(function() {
  "use strict";

  const script = document.createElement("script");

  script.appendChild(
    document.createTextNode(`
       function autoLogin() {
         const username = document.getElementById('username');
         const loginButton = document.getElementById('flogin');
         if (username && loginButton) {
           username.value =  'z0044w9p';
           loginButton.submit();
         }
       }
       autoLogin();
    `)
  );
  document.body.appendChild(script);
})();
