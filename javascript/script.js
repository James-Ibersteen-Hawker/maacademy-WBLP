"use strict";
const { createApp, ref, reactive, onMounted } = Vue;
const weblink =
  "https://script.google.com/macros/s/AKfycbzYbswK98IKpxzb4J58kxBMEa1-_HFqBkAAsP1GliMghJXUFuEVA1y9v6WCY3a6uLpe/exec";
const signalTimeout = 20000;
const keys = {
  dataKey: "sheetData",
  searchKey: "searchData",
};
const hourInMillis = 60 * 60 * 1000;
const dataTimeout = 6;
const workerTimeout = 30000;
const workerName = location.pathname.includes("/html/")
  ? "../javascript/worker.js"
  : "./javascript/worker.js";
const worker = new Worker(workerName, { type: "module" });
const REPONAME = "/maacademy-WBLP";
const root = location.pathname.includes("/html/") ? "../" : "./";
const defaultCarousel = new Array(6).fill(root + "imgs/no-image.png");
let searchLUT;
let engine;
let engineStart = () => { };
let engineReject = () => { };
const pages = [
  new Page("Home", "index.html", "webicons/navbar-icons/home.png"),
  new Page(
    "About Us",
    "about-us.html",
    "webicons/navbar-icons/information.png",
  ),
  new Page("Contact", "contact.html", "webicons/navbar-icons/phone-call.png"),
  new Page("Classes", "classes.html", "webicons/navbar-icons/music.png"),
  new Page("Teachers", "teachers.html", "webicons/navbar-icons/teacher.png"),
  new Page("Parties", "parties.html", "webicons/navbar-icons/party.png"),
  new Page(
    "Radio City",
    "radio-city.html",
    "webicons/navbar-icons/radio-city.png",
  ),
  new Page("Gallery", "gallery.html", "webicons/navbar-icons/images.png"),
];
const App = createApp({
  setup() {
    const copyright = "Copyright 2026 Music and Art Academy";
    const content = ref({});
    const results = reactive({ data: [] });
    const loading = ref(false);
    const currentLocation = window.location.href;
    function setupSearch() {
      const searchString = window.location.search;
      const urlParams = new URLSearchParams(searchString);
      const query = urlParams.get("q");
      const iframe = urlParams.get("iframe");
      if (!iframe) {
        initSearch().then((data) => {
          searchLUT = Object.entries(data).map(([page, text]) => ({
            page,
            text
          }));
          engine = new Fuse(searchLUT, {
            keys: ["text"],
            ignoreDiacritics: true,
            includeMatches: true,
            threshold: 0.4,
            ignoreLocation: true,
          });
          engineStart();
        });
      } else if (iframe) {
        document
          .querySelectorAll(
            'img, link[rel="stylesheet"]:not([href*="vue"]), link[rel="preload"]:not([as="script"]), meta[name]:not([name="viewport"])',
          )
          .forEach((e) => e.remove());
      }
      Vue.nextTick(() => {
        try {
          if (query) goToSearch(query);
          if (iframe) {
            window.parent.postMessage(
              { loaded: true, pageName: window.location.pathname },
              window.location.origin,
            );
          }
        } catch (err) {
          console.log(err);
        }
      });
    }
    loadData()
      .then((data) => {
        content.value = data;
        console.log(data);
        try {
          setupSearch();
        } catch {
          throw new Error("Setting up the search iframes failed")
        }
      })
      .catch((err) => alert(err.message));
    async function searchSite(input) {
      loading.value = true;
      engineReject();
      if (!engine) {
        results.data = [];
        new Promise((resolve, reject) => {
          engineStart = resolve;
          engineReject = reject;
        }).then(() => {
          searchSite(input);
          engineStart = () => { };
        });
      } else {
        const output = engine.search(input.trim());
        const convertArray = output.map(({ item, matches }) => {
          const { value, indices } = matches[0];
          const properIndexes = indices.filter(([start, end]) => end > start);
          const sortedArr = properIndexes.sort((a, b) => {
            const aDistance = a[1] - a[0] + 1;
            const bDisance = b[1] - b[0] + 1;
            return bDisance - aDistance;
          });
          const [start, end] = sortedArr[0];
          const string = value.slice(start, end + 1);
          let preamble = "";
          let postamble = "";
          const threshold = 8;
          if (start > 0) {
            const begin = Math.max(0, start - threshold);
            preamble = value.slice(begin, start);
          }
          if (end < value.length) {
            const stop = Math.min(value.length, end + threshold);
            postamble = value.slice(end + 1, stop + 1);
          }
          const { page: link } = item;
          return new Hit(string, preamble, postamble, link);
        });
        loading.value = false;
        results.data = convertArray;
      }
    }
    function runSelection({ exact, url }) {
      const path = url === "index.html" ? "" : "/html";
      const inRepo = window.location.pathname.includes(REPONAME);
      const repoBase = inRepo ? REPONAME : "";
      window.location.href = `${window.location.origin}${repoBase}${path}/${url}?q=${encodeURIComponent(exact.trim())}`;
    }
    function filterTeachers({data: filters}) {
      const elems = Array.from(document.querySelectorAll(".teacher-container"));
      elems.forEach(el => el.classList.remove("d-none"))
      const applied = Object.entries(filters).filter(([_, v]) => Boolean(v)).map(([k]) => k);
      if (applied.length === 0) return;
      const out = elems.filter(el => {
        const specs = el.getAttribute("data-specs")?.split(",")?.map(q => q.trim().toLowerCase());
        if (!specs) return true;
        return !applied.every(fil => specs.includes(fil.toLowerCase()))
      })
      out.forEach(el => el.classList.add("d-none"))
    }
    function seeSchedule(e) {
      const name = e;
      const inRepo = window.location.pathname.includes(REPONAME);
      const repoBase = inRepo ? REPONAME : "";
      window.location.href = `${window.location.origin}${repoBase}/html/classes.html?q=${encodeURIComponent(name.trim())}`;
    }
    onMounted(async () => {
      const searchString = window.location.search;
      const urlParams = new URLSearchParams(searchString);
      const accordion = urlParams.get("accordion");
      if (accordion) {
        await Vue.nextTick()
        const elems = Array.from(document.querySelectorAll(".accordion"));
        console.log(elems, accordion)
        if (elems.length > 0) {
          const match = elems.find((e) => e.getAttribute("data-instrument").toLowerCase() === accordion.toLowerCase());
          console.log(match)
          
        }
      }
    })
    return {
      searchSite,
      content,
      pages,
      results,
      runSelection,
      copyright,
      filterTeachers,
      // testInstrument,
      loading,
      weblink,
      currentLocation,
      defaultCarousel,
      seeSchedule
    };
  },
});
App.component("nav-bar", navBar);
App.component("page-footer", footer);
App.component("img-carousel", imgCarousel);
App.component("teacher", teacherCard);
App.component("instrument-accordion", instrumentComponent);
App.component("class-filter", classFilter);
App.component("special-class", specialClass);
App.component("loading", loader);

App.mount("#vue_app");

//////////////////////////////

function getSheetData() {
  return new Promise((resolve, reject) => {
    if (!window.Worker)
      return reject(new Error("Workers are unsupported by this browser"));
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      worker.terminate();
      settled = true;
      reject(new Error("Worker timed out"));
    }, workerTimeout);
    function clear() {
      clearTimeout(timeout);
      worker.terminate();
    }
    worker.addEventListener("message", (e) => {
      if (settled) return;
      settled = true;
      const { data, err } = e.data;
      clear();
      if (err) reject(err);
      else if (!err && data) resolve(data);
      else reject(new Error("No Data Returned"));
    });
    worker.addEventListener(
      "error",
      (err) => {
        if (settled) return;
        settled = true;
        clear();
        reject(err);
      },
      { once: true },
    );
    try {
      worker.postMessage({
        mode: "load",
        link: weblink,
        timeout: signalTimeout,
      });
    } catch (err) {
      reject(err);
    }
  });
}
async function loadData() {
  const slot = localStorage.getItem(keys.dataKey);
  if (slot) {
    try {
      const [payload, time] = JSON.parse(slot);
      const diff = Date.now() - new Date(time).getTime();
      const isFresh = diff < dataTimeout * hourInMillis;
      if (isFresh) return payload;
    } catch (err) {
      console.log(err);
    }
  }
  const data = await getSheetData();
  if (!data) throw new Error("No Data Fetched!");
  const storage = JSON.stringify([data, new Date()]);
  localStorage.setItem(keys.dataKey, storage);
  return data;
}
async function initSearch() {
  return new Promise((resolve, reject) => {
    try {
      const savedLUT = sessionStorage.getItem(keys.searchKey);
      if (savedLUT) return resolve(JSON.parse(savedLUT));
      else {
        const path = window.location.pathname;
        const inRepo = path.includes(REPONAME);
        const repoBase = inRepo ? REPONAME : "";
        const links = pages.map(({ url }) =>
          url === "index.html" ? url : `html/${url}`,
        );
        const loadedPages = new Set();
        window.addEventListener("message", (e) => {
          const data = handleMessage(e, loadedPages);
          if (data) {
            sessionStorage.setItem(keys.searchKey, JSON.stringify(data));
            resolve(data);
          }
        });
        links.forEach((link) => {
          const iframe = document.createElement("iframe");
          iframe.src = `${window.location.origin}${repoBase}/${link}?iframe=true`;
          iframe.width = "0";
          iframe.height = "0";
          iframe.style.display = "none";
          iframe.classList.add("utilIframeJS");
          document.body.appendChild(iframe);
        });
      }
    } catch (err) {
      reject(err);
    }
  });
}
function goToSearch(q) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );
  const lower = q.toLowerCase();
  let node, match;
  while ((node = walker.nextNode())) {
    const value = node.nodeValue.toLowerCase();
    if (!value.includes(lower)) continue;
    match = node;
    break;
  }
  if (!match) throw new Error("No match!");
  const fragment = document.createDocumentFragment();
  const words = match.nodeValue;
  const start = words.toLowerCase().indexOf(lower);
  const end = start + lower.length;
  const matchedText = words.slice(start, end).trim();
  if (start === -1) throw new Error("No Match!");
  if (start > 0) {
    fragment.appendChild(document.createTextNode(words.slice(0, start)));
  }
  const span = document.createElement("span");
  span.classList.add("searchResult");
  span.textContent = matchedText;
  fragment.appendChild(span);
  if (start < words.length - 1) {
    fragment.appendChild(document.createTextNode(words.slice(end)));
  }
  match.parentNode.replaceChild(fragment, match);
  span.scrollIntoView({ behavior: "smooth", block: "center" });
}
function handleMessage({ data }, list) {
  list.add(data.pageName.split("/").at(-1));
  if (list.size < pages.length) return;
  const iframes = document.querySelectorAll("iframe.utilIframeJS");
  return Array.from(iframes).reduce((acc, iframe) => {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.querySelectorAll("script, style").forEach((e) => e.remove());
    const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    const text = [];
    let node;
    while ((node = walker.nextNode())) {
      const trimmed = node.nodeValue?.trim();
      if (trimmed) text.push(trimmed);
    }
    const src = iframe.src.split("/").pop().split("?")[0];
    acc[src] = text.join(" ");
    iframe.remove();
    return acc;
  }, {});
}