!function(){"use strict";var t,n={88844:function(t,n,e){e(41539),e(54747),e(92222),e(91058);var r="750px",o="1100px",i="1350px",c="1650px",a="2000px",s={XSMALL:parseInt("375px"),SMALL:parseInt(r),MEDIUM:parseInt(o),LARGE:parseInt(i),XLARGE:parseInt(c),XXLARGE:parseInt(a)},l=function(t){return window.innerWidth<s[t]},u="is-active",f="is-visible",d="is-initialised",v=function(t,n){var e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"0px",r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:.5,o=new IntersectionObserver((function(e){e.forEach((function(e){e.intersectionRatio>=r&&n(t)}))}),{threshold:r,rootMargin:e});o.observe(t)},h="[data-featured-collections-link]",p="[data-featured-collections-image]",L="data-collection-handle";document.querySelectorAll("[data-featured-collections-container]").forEach((function(t){if(!t.classList.contains(d)){t.classList.add(d);var n=t.querySelector("[data-featured-collections-list]");if(n&&(n.querySelectorAll(h).forEach((function(n){n.addEventListener("mouseover",(function(n){return E({e:n,container:t})}))})),l("MEDIUM"))){var e=n.querySelector(h);v(n,(function(){e&&e.classList.add(u)}),"0px",1),n.querySelectorAll(h).forEach((function(t){t.addEventListener("touchstart",(function(){t!==e&&(null==e||e.classList.remove(u))}))}))}}}));var E=function(t){var n=t.e,e=t.container,r=n.target;if(r&&!l("MEDIUM")&&!r.classList.contains(u)){var o=r.getAttribute(L);if(o){var i="".concat(p,"[").concat(L,'="').concat(o,'"]'),c=e.querySelectorAll(i);if(c&&!(c.length<1)){e.querySelectorAll("".concat(h,".").concat(u)).forEach((function(t){t.classList.remove(u)})),r.classList.add(u);var a="".concat(p,".").concat(f);e.querySelectorAll(a).forEach((function(t){t.classList.remove(f)})),c.forEach((function(t){return t.classList.add(f)}))}}}}},81415:function(){}},e={};function r(t){var o=e[t];if(void 0!==o)return o.exports;var i=e[t]={exports:{}};return n[t].call(i.exports,i,i.exports,r),i.exports}r.m=n,t=[],r.O=function(n,e,o,i){if(!e){var c=1/0;for(u=0;u<t.length;u++){e=t[u][0],o=t[u][1],i=t[u][2];for(var a=!0,s=0;s<e.length;s++)(!1&i||c>=i)&&Object.keys(r.O).every((function(t){return r.O[t](e[s])}))?e.splice(s--,1):(a=!1,i<c&&(c=i));if(a){t.splice(u--,1);var l=o();void 0!==l&&(n=l)}}return n}i=i||0;for(var u=t.length;u>0&&t[u-1][2]>i;u--)t[u]=t[u-1];t[u]=[e,o,i]},r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),r.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},r.j=6162,function(){var t={6162:0};r.O.j=function(n){return 0===t[n]};var n=function(n,e){var o,i,c=e[0],a=e[1],s=e[2],l=0;if(c.some((function(n){return 0!==t[n]}))){for(o in a)r.o(a,o)&&(r.m[o]=a[o]);if(s)var u=s(r)}for(n&&n(e);l<c.length;l++)i=c[l],r.o(t,i)&&t[i]&&t[i][0](),t[i]=0;return r.O(u)},e=self.webpackChunkerstwilder=self.webpackChunkerstwilder||[];e.forEach(n.bind(null,0)),e.push=n.bind(null,e.push.bind(e))}(),r.O(void 0,[4736],(function(){return r(88844)}));var o=r.O(void 0,[4736],(function(){return r(81415)}));o=r.O(o)}();