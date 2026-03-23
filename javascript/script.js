"use strict";
const { createApp, ref, reactive, onMounted } = Vue;
console.log("JS working");
const weblink =
  "https://script.google.com/macros/s/AKfycbzYbswK98IKpxzb4J58kxBMEa1-_HFqBkAAsP1GliMghJXUFuEVA1y9v6WCY3a6uLpe/exec";
const signalTimeout = 10000;
const keys = {
  dataKey: "sheetData",
  searchKey: "searchData",
};
const hourInMillis = 60 * 60 * 1000;
const dataTimeout = 12;
const workerName = location.pathname.includes("/html/")
  ? "../javascript/worker.js"
  : "./javascript/worker.js";
const worker = new Worker(workerName, { type: "module" });
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
        console.log(data);
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
      console.log("mounted");
      window.parent.postMessage(
        { loaded: true, pageName: window.location.pathname },
        window.location.origin,
      );
      const searchString = window.location.search;
      const urlParams = new URLSearchParams(searchString);
      const query = urlParams.get('q');
      if (query) goToSearch(q);
      //use the message via the iframe and window.addEventListener("message", ()=> {}...)
      //to deal with the loading of the multiple iframes
      //then extract textContent and send that to the web worker
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
    console.log("in promise");
    worker.onmessage = (e) => {
      const { data, err } = e.data;
      if (err) reject(err);
      else if (!err && data) resolve(data);
      else reject(new Error("No Data Returned"));
    };
    worker.onerror = (err) => reject(err);
    worker.postMessage({ mode: "load", link: weblink, timeout: signalTimeout });
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
async function initSearch() {}
function goToSearch(q) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let node, match;
  while((node = walker.nextNode())) {
    const value = node.nodeValue.toLowerCase();
    const input = q.toLowerCase();
    if (value.includes(input)) {
      match = node;
      break;
    }
  }
  if (!match) {
    alert("not found!");
    return;
  }
  //style the node
  const fragment = document.createDocumentFragment();
  const words = match.nodeValue.split(" ");
  const index = words.findIndex(e => e.toLowerCase().includes(q.toLowerCase()))
  if (index === -1) {
    alert("not found");
    return;
  };
  if (index > 0) {
    fragment.appendChild(document.createTextNode(words.slice(0, index).join(" ") + " "))
  }
  const span = document.createElement("span");
  span.style.backgroundColor = "yellow";
  span.textContent = words[index];
  fragment.appendChild(span);
  if (index < words.length - 1) {
    fragment.appendChild(document.createTextNode(" " + words.slice(index + 1).join(" ")))
  }
  match.parentNode.replaceChild(fragment, match);
}
