!function(){"use strict";var e,n={40600:function(e,n,t){t(41539),t(54747);var r="is-initialised",o=(t(82772),t(91058),t(54678),".6s"),i="1.5s",c="cubic-bezier(.16,1,.3,1)",a=function(e){return e?-1!==e.indexOf("ms")?parseInt(e):-1!==e.indexOf("s")?1e3*parseFloat(e):-1:-1},u=(a(".2s"),a(o)),f=(a(i),c);t(82526),t(41817),t(32165),t(66992),t(78783),t(33948);function s(e){return s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s(e)}var l,d,p,h="750px",v="1100px",y="1350px",b="1650px",g="2000px",S=parseInt("375px"),m=parseInt(h),w=parseInt(v),x=parseInt(y),L=parseInt(b),A=parseInt(g),q={XSMALL:S,SMALL:m,MEDIUM:w,LARGE:x,XLARGE:L,XXLARGE:A},E="[data-accordion-slide]",O="[data-accordion-title]",I="[data-accordion-content]",k=null,H=!1,j=function(e,n,t,r,o,i){if(e.preventDefault(),!(i&&(c=i,window.innerWidth>=q[c]))){var c;n.style.overflow="hidden",t||!n.open?z(n,r,o,t):(r||n.open)&&T(n,r,o,t);var a=function(e,n){return e.target&&(e.target instanceof HTMLElement||e.target instanceof SVGElement)&&"undefined"!==s(e.target.matches)?e.target.matches(n)?e.target:e.target.closest(n):null}(e,E);X(a)}},z=function(e,n,t,r){e.style.height="".concat(e.offsetHeight,"px"),e.open=!0,window.requestAnimationFrame((function(){return M(e,n,t,r)}))},M=function(e,n,t,r){var o=e.querySelector(O);if(o){var i=e.querySelector(I);if(i){n=!0;var c="".concat(e.offsetHeight,"px"),a="".concat(o.offsetHeight+i.offsetHeight,"px");t&&t.cancel(),(t=e.animate({height:[c,a]},{duration:u,easing:f})).onfinish=function(){return G(e,n,t,!0,r)},t.oncancel=function(){return n=!1}}}},G=function(e,n,t,r,o){e.open=r,e.style.height=e.style.overflow=""},T=function(e,n,t,r){var o=e.querySelector(O);if(o&&e.querySelector(I)){r=!0;var i="".concat(e.offsetHeight,"px"),c="".concat(o.offsetHeight,"px");t&&t.cancel(),(t=e.animate({height:[i,c]},{duration:u,easing:f})).onfinish=function(){return G(e,n,t,!1,r)},t.oncancel=function(){return r=!1}}},X=function(e){k&&!H&&(H=!0,k.forEach((function(n){if(n!=e&&n.open){var t=n.querySelector(O);t&&t.click()}})),setTimeout((function(){return H=!1}),500))},F=function(e){var n=e.container,t=e.disableSize;if(null!==n){n.removeAttribute("open");var r=n.querySelector(O);if(r)if(n.querySelector(I)){r.addEventListener("click",(function(e){return j(e,n,false,false,null,t)}))}}else console.error("Accordion not found")},R=function(e){(k=e.querySelectorAll(E))&&e.classList.contains(r)&&(e.classList.remove(r),k.forEach((function(e){return e.setAttribute("open","open")})))},W=function(e){(k=e.querySelectorAll(E))&&(e.classList.contains(r)||(e.classList.add(r),k.forEach((function(e){return e.removeAttribute("open")}))))},C=document.querySelector("[data-footer]");if(C){var D=C.querySelector("[data-accordion-container]");D&&(d=(l={container:D,disableSize:"SMALL"}).container,p=l.disableSize,(k=d.querySelectorAll(E))&&(d.classList.contains(r)||(d.classList.add(r),k.forEach((function(e){return F({container:e,disableSize:p})})))),window.innerWidth<m?W(D):R(D),window.addEventListener("resize",(function(){window.innerWidth<m?W(D):R(D)})))}},2386:function(){}},t={};function r(e){var o=t[e];if(void 0!==o)return o.exports;var i=t[e]={exports:{}};return n[e].call(i.exports,i,i.exports,r),i.exports}r.m=n,e=[],r.O=function(n,t,o,i){if(!t){var c=1/0;for(s=0;s<e.length;s++){t=e[s][0],o=e[s][1],i=e[s][2];for(var a=!0,u=0;u<t.length;u++)(!1&i||c>=i)&&Object.keys(r.O).every((function(e){return r.O[e](t[u])}))?t.splice(u--,1):(a=!1,i<c&&(c=i));if(a){e.splice(s--,1);var f=o();void 0!==f&&(n=f)}}return n}i=i||0;for(var s=e.length;s>0&&e[s-1][2]>i;s--)e[s]=e[s-1];e[s]=[t,o,i]},r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),r.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},r.j=7456,function(){var e={7456:0};r.O.j=function(n){return 0===e[n]};var n=function(n,t){var o,i,c=t[0],a=t[1],u=t[2],f=0;if(c.some((function(n){return 0!==e[n]}))){for(o in a)r.o(a,o)&&(r.m[o]=a[o]);if(u)var s=u(r)}for(n&&n(t);f<c.length;f++)i=c[f],r.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return r.O(s)},t=self.webpackChunkerstwilder=self.webpackChunkerstwilder||[];t.forEach(n.bind(null,0)),t.push=n.bind(null,t.push.bind(t))}(),r.O(void 0,[4736],(function(){return r(40600)}));var o=r.O(void 0,[4736],(function(){return r(2386)}));o=r.O(o)}();