import{L as i}from"./vendor.427851ec.js";const u=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function s(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerpolicy&&(o.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?o.credentials="include":e.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(e){if(e.ep)return;e.ep=!0;const o=s(e);fetch(e.href,o)}};u();const m="https://github-cdn.vercel.app/igorsaux/webmap/master/maps.json",f="https://raw.githubusercontent.com/igorsaux/webmap/master/images/";function p(n){const t=document.createElement("div");t.id="webmap",document.body.appendChild(t);const s=i.map(t,{center:[-125,125],zoom:4,crs:i.CRS.Simple,maxZoom:6}),a=n.name.toLocaleLowerCase();let e;s.fitBounds(n.bounds),s.setMaxBounds(n.bounds);const o={};i.tileLayer("./space.png",{tileSize:i.point(322,322),noWrap:!1}).addTo(s);for(const r in n.levels){const c=n.levels[r],d=c.path.split("/");let l=d[d.length-1];l=l.substring(0,l.length-4),o[c.name]=i.imageOverlay(`${f}${a}/${l}-1.png`,c.bounds||n.bounds),r===n.mainLevel&&(e=o[c.name])}e==null||e.addTo(s),i.control.layers(o).addTo(s)}function h(n){const t=document.createElement("div");t.id="ListOfMaps";const s=document.createElement("h1");s.innerText="- \u0421\u043F\u0438\u0441\u043E\u043A \u043A\u0430\u0440\u0442 -",t.appendChild(s);for(const a of n){const e=document.createElement("a");e.innerText=a.name,e.href=`#/${a.name.toLowerCase()}`,t.appendChild(e)}document.body.appendChild(t)}async function g(){const n=await(await fetch(m)).json(),t=location.hash.replace("#/","").toLowerCase(),s=n.maps.find(a=>a.name.toLowerCase()===t);if(!s||!t)return h(n.maps);p(s)}g();window.onhashchange=function(){location.reload()};
