!function(){"use strict";var e,t={40263:function(e,t,r){r(41539),r(54747);var n="is-visible",i="is-initialised";document.querySelectorAll("[data-featured-video-container]").forEach((function(e){if(!e.classList.contains(i)){e.classList.add(i);var t=e.querySelector("[data-video-play]"),r=e.querySelector("[data-video]"),o=e.querySelector("[data-featured-video]");t&&r&&o&&o.addEventListener("click",(function(){r.muted=!1,r.paused?(r.play(),t.classList.remove(n)):(r.pause(),t.classList.add(n))}))}}))},86028:function(){}},r={};function n(e){var i=r[e];if(void 0!==i)return i.exports;var o=r[e]={exports:{}};return t[e].call(o.exports,o,o.exports,n),o.exports}n.m=t,e=[],n.O=function(t,r,i,o){if(!r){var a=1/0;for(f=0;f<e.length;f++){r=e[f][0],i=e[f][1],o=e[f][2];for(var u=!0,c=0;c<r.length;c++)(!1&o||a>=o)&&Object.keys(n.O).every((function(e){return n.O[e](r[c])}))?r.splice(c--,1):(u=!1,o<a&&(a=o));if(u){e.splice(f--,1);var s=i();void 0!==s&&(t=s)}}return t}o=o||0;for(var f=e.length;f>0&&e[f-1][2]>o;f--)e[f]=e[f-1];e[f]=[r,i,o]},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.j=5018,function(){var e={5018:0};n.O.j=function(t){return 0===e[t]};var t=function(t,r){var i,o,a=r[0],u=r[1],c=r[2],s=0;if(a.some((function(t){return 0!==e[t]}))){for(i in u)n.o(u,i)&&(n.m[i]=u[i]);if(c)var f=c(n)}for(t&&t(r);s<a.length;s++)o=a[s],n.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return n.O(f)},r=self.webpackChunkerstwilder=self.webpackChunkerstwilder||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))}(),n.O(void 0,[4736],(function(){return n(40263)}));var i=n.O(void 0,[4736],(function(){return n(86028)}));i=n.O(i)}();