"use strict";
const { createApp, ref, reactive, onMounted } = Vue;
// console.log("JS working");
const weblink =
  "https://script.google.com/macros/s/AKfycbzYbswK98IKpxzb4J58kxBMEa1-_HFqBkAAsP1GliMghJXUFuEVA1y9v6WCY3a6uLpe/exec";
const signalTimeout = 10000;
const keys = {
  dataKey: "sheetData",
  searchKey: "searchData",
};
const hourInMillis = 60 * 60 * 1000;
const dataTimeout = 12;
const workerTimeout = 30000;
const workerName = location.pathname.includes("/html/")
  ? "../javascript/worker.js"
  : "./javascript/worker.js";
const worker = new Worker(workerName, { type: "module" });
let searchLUT;
let engine;
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
const media = [
  new MediaIcon("youtubeIcon", "https://youtube.com", "YouTube Link"),
  new MediaIcon("instagramIcon", "https://instagram.com", "Instagram Link"),
  new MediaIcon("facebookIcon", "https://facebook.com", "Facebook Link"),
];
const teachers = [
  new Teacher(
    "Jefferey Pantelas",
    "/MAINLOGO.png",
    ["Piano", "Voice"],
    "Jeffrey Pantelas: Music Teacher.Instruments: Piano,Accordion and Electronic keyboards , Vocal training and Chorus.Band leader ,Adonis Orchestra 1981-1992. Music teacher NYC.Bd.of  Education 1985-2016, Project Arts Coordinator P.S.132 Manhattan (9 years).Teacher of piano,accordion and vocal training/chorus Music and Art Academy 2016-present.Education:Accordion and piano 7 years training, Bachelor’s Degree, Baruch college in...",
  ),
  new Teacher(
    "Jefferey Pantelas",
    "/MAINLOGO.png",
    ["Piano", "Voice"],
    "About Jeff",
  ),
  new Teacher(
    "Jefferey Pantelas",
    "/MAINLOGO.png",
    ["Piano", "Voice"],
    "About Jeff",
  ),
];
const testInstrument = new Instrument("Piano", [
  {
    TEACHERS: { ...teachers[0] },
    SCHEDULES: {
      SUN: "",
      MON: "P: 3pm-9pm",
      TUES: "5:30pm-7pm",
      WED: "10am-3pm",
    },
  },
]);
const App = createApp({
  setup() {
    const copyright = "Copyright 2026 Music and Art Academy";
    const content = ref({});
    const results = reactive({ data: [] });
    loadData()
      .then((data) => {
        content.value = data;
      })
      .catch((err) => alert(err.message));
    function searchSite(input) {
      if (!engine) results.data = [];
      else {
        const output = engine.search(input);
        const convertArray = output.map(({item, matches}) => {
          const { value, indices } = matches[0];
          const properIndexes = indices.filter(([start, end]) => end > start);
          const sortedArr = properIndexes.sort((a,b) => {
            const aDistance = a[1] - a[0] + 1;
            const bDisance = b[1] - b[0] + 1;
            return bDisance - aDistance
          })
          const [start, end] = sortedArr[0];
          const string = value.slice(start, end + 1);
          console.log(string)
          let preamble = "";
          let postamble = "";
          const threshold = 5;
          if (start > 0) {
            const begin = Math.max(0, start - threshold);
            preamble = value.slice(begin, start);
          }
          if (end < value.length) {
            const stop = Math.min(value.length, end + threshold);
            postamble = value.slice(end + 1, stop + 1);
          }
          const match = preamble + string + postamble;
          const { page: link } = item;
          console.log(match, link);
          return new Hit(string, match, link);
        })
      }
    }
    function runSelection({match, url}) {
      alert([match, url]);
      const path = url === "index.html" ? "" : "/html";
      window.location.href = `${window.location.origin}${path}/${url}?q=${encodeURIComponent(match)}`;
    }
    function testEmit(e) {
      alert("emit");
    }
    onMounted(() => {
      const searchString = window.location.search;
      const urlParams = new URLSearchParams(searchString);
      const query = urlParams.get("q");
      const iframe = urlParams.get("iframe");
      if (!iframe)
        initSearch().then((data) => {
          searchLUT = Object.entries(data).map(([page, text]) => ({page, text}));
          engine = new Fuse(searchLUT, {
            keys: ["text"],
            ignoreDiacritics: true,
            includeMatches: true,
            threshold: 0.4,
            ignoreLocation: true,
          });
        });
      else if (iframe) {
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
    });
    return {
      searchSite,
      content,
      pages,
      media,
      results,
      runSelection,
      copyright,
      testEmit,
      teachers,
      testInstrument,
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
      if (savedLUT) resolve(JSON.parse(savedLUT));
      else {
        const path = window.location.pathname;
        const subTrue = path.includes("/html/");
        const links = pages.map(({ url }) => {
          if (subTrue) return url === "index.html" ? `../${url}` : url;
          else return url === "index.html" ? url : `html/${url}`;
        });
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
          iframe.src = `${window.location.origin}/${link}?iframe=true`;
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
  if (words.toLowerCase().includes(lower)) console.log("here");
  const start = words.toLowerCase().indexOf(lower);
  const end = start + lower.length;
  const matchedText = words.slice(start, end);
  if (start === -1) throw new Error("No Match!");
  if (start > 0) {
    fragment.appendChild(document.createTextNode(words.slice(0, start) + " "));
  }
  const span = document.createElement("span");
  span.classList.add("searchResult");
  span.textContent = matchedText;
  fragment.appendChild(span);
  if (start < words.length - 1) {
    fragment.appendChild(document.createTextNode(" " + words.slice(end + 1)));
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
