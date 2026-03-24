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
      results.data = [
        new Hit("Higgeldy Piggeldy 1", "link.html"),
        new Hit("Higgeldy Piggeldy 2", "link.html"),
        new Hit("Higgeldy Piggeldy 3", "link.html"),
        new Hit("Higgeldy Piggeldy 4", "link.html"),
        new Hit("Higgeldy Piggeldy 5", "link.html"),
        new Hit("Higgeldy Piggeldy 6", "link.html"),
        new Hit("Higgeldy Piggeldy 7", "link.html"),
        new Hit("Higgeldy Piggeldy 7", "link.html"),
        new Hit("Higgeldy Piggeldy 7", "link.html"),
        new Hit("Higgeldy Piggeldy 7", "link.html"),
      ];
    }
    function runSelection(selection) {
      alert(selection.match);
    }
    function testEmit(e) {
      alert("emit");
    }
    onMounted(() => {
      const searchString = window.location.search;
      const urlParams = new URLSearchParams(searchString);
      const query = urlParams.get("q");
      const iframe = urlParams.get("iframe");
      if (!iframe) initSearch().then((data) => searchLUT = data);
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
    if (!window.Worker) return reject(new Error("Workers are unsupported by this browser"))
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
      worker.addEventListener("error", (err) => {
        if (settled) return;
        settled = true;
        clear();
        reject(err);
      }, {once: true})
      try {
        worker.postMessage({ mode: "load", link: weblink, timeout: signalTimeout });
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
          };
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
  let node, match;
  while ((node = walker.nextNode())) {
    const value = node.nodeValue.toLowerCase();
    const input = q.toLowerCase();
    if (!value.includes(input)) continue;
    match = node;
    break;
  }
  if (!match) throw new Error("No match!");
  const fragment = document.createDocumentFragment();
  const words = match.nodeValue.split(" ");
  const index = words.findIndex((e) =>
    e.toLowerCase().includes(q.toLowerCase()),
  );
  if (index === -1) throw new Error("No match!");
  if (index > 0) {
    fragment.appendChild(
      document.createTextNode(words.slice(0, index).join(" ") + " "),
    );
  }
  const span = document.createElement("span");
  span.classList.add("searchResult");
  span.textContent = words[index];
  fragment.appendChild(span);
  if (index < words.length - 1) {
    fragment.appendChild(
      document.createTextNode(" " + words.slice(index + 1).join(" ")),
    );
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
