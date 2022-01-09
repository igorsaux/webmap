import{j as g,L as i}from"./vendor.28530bdd.js";const b=function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const c of t.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function a(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?t.credentials="include":e.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function r(e){if(e.ep)return;e.ep=!0;const t=a(e);fetch(e.href,t)}};b();const v="https://raw.githubusercontent.com/igorsaux/webmap/master/kartograf.yaml",w="https://raw.githubusercontent.com/igorsaux/webmap/master/images/";function y(s,o,a){return`${w}${s}-${o}-${a}.png`}function L(s,o,a){const r=document.createElement("div");r.id="webmap",document.body.appendChild(r);const e=i.map(r,{center:[-125,125],zoom:4,crs:i.CRS.Simple,maxZoom:6,minZoom:2});e.attributionControl.setPrefix('OnyxBay \u2022 Igor Spichkin 2021 \u2022 <a href="https://github.com/igorsaux/webmap">GitHub</a>'),e.addLayer(i.tileLayer("./space.png",{tileSize:i.point(322,322),noWrap:!1}).addTo(e));let t;e.fitBounds(o.bounds),e.setMaxBounds(o.bounds);let c=i.control.layers().addTo(e);const m={},u={},p=n=>{for(const d of Object.keys(u))for(const l of Object.values(u[d]))c.removeLayer(l);const f=u[n];for(const d in f){const l=f[d];c.addOverlay(l,d)}};for(const n in o.levels){const f=o.levels[n],d=[];u[n]={};for(const l of o.layers.slice(1)){const h=a[l];u[n][h.display]=i.imageOverlay(y(s,n,l),o.bounds)}if(f.underlays)for(const l of f.underlays)d.push(i.imageOverlay(y(s,l,o.layers[0]),o.bounds,{className:"UnderlayLayer"}));m[n]=i.layerGroup(d).addLayer(i.imageOverlay(y(s,n,o.layers[0]),o.bounds)),c.addBaseLayer(m[n],n),n===o.mainLevel&&(t=m[n],p(n))}t==null||t.addTo(e),e.on("baselayerchange",n=>p(n.name))}function O(s){const o=document.createElement("div");o.id="ListOfMaps";const a=document.createElement("h1");a.innerText="- \u0421\u043F\u0438\u0441\u043E\u043A \u043A\u0430\u0440\u0442 -",o.appendChild(a);for(const r in s){const e=document.createElement("a");e.innerText=r,e.href=`#/${r.toLowerCase()}`,o.appendChild(e)}document.body.appendChild(o)}async function x(){const s=await(await fetch(v)).text(),o=g.load(s),a=location.hash.replace("#/","").toLowerCase(),r=Object.keys(o.groups).find(e=>e.toLowerCase()===a);if(!r||!a)return O(o.groups);L(r,o.groups[r],o.layers)}x();window.onhashchange=function(){location.reload()};
