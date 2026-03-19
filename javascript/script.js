"use strict";
const { createApp, ref, reactive } = Vue;
console.log("working")
const weblink = "https://script.google.com/macros/s/AKfycbzYbswK98IKpxzb4J58kxBMEa1-_HFqBkAAsP1GliMghJXUFuEVA1y9v6WCY3a6uLpe/exec";
const signalTimeout = 10000;
const workerName = location.pathname.includes("/html/") ? '../javascript/worker.js' : "./javascript/worker.js";
const worker = new Worker(workerName, { type: "module" });
const pages = [
  new Page("Home", "index.html", "webicons/navbar-icons/home.png"),
  new Page("About Us", "about-us.html", "webicons/navbar-icons/information.png"),
  new Page("Contact", "contact.html", "webicons/navbar-icons/phone-call.png"),
  new Page("Classes", "classes.html", "webicons/navbar-icons/music.png"),
  new Page("Teachers", "teachers.html", "webicons/navbar-icons/teacher.png"),
  new Page("Parties", "parties.html", "webicons/navbar-icons/party.png"),
  new Page("Radio City", "radio-city.html", "webicons/navbar-icons/radio-city.png"),
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
    "About Jeff",
  ),
];
const testInstrument = new Instrument("Piano", [{
  TEACHERS: {...teachers[0]},
  SCHEDULES: {
    "SUN": "",
    "MON": "P: 3pm-9pm",
    "TUES": "5:30pm-7pm",
    "WED": "10am-3pm",
  }
}])
const App = createApp({
  setup() {
    const copyright = "Copyright 2026 Music and Art Academy";
    const content = ref({});
    const results = reactive({ data: [] });
    getSheetData()
      .then((data) => (content.value = data))
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
      testInstrument
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
    console.log("here");
    console.log(worker)
    worker.onmessage = (e) => {
      const { data, err } = e.data;
      if (err) reject(err);
      else if (!err && data) resolve(data);
      else reject(new Error("No Data Returned"));
    };
    worker.postMessage({ mode: "load", link: weblink, timeout: signalTimeout });
  });
}
