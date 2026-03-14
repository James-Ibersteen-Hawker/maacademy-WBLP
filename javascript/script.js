"use strict";
const { createApp, ref, reactive } = Vue;
const worker = new Worker(`/javascript/worker.js`, { type: "module" });
const pages = [
  new Page("Home", "index.html", "iconurl"),
  new Page("About Us", "/html/about-us.html", "iconurl"),
  new Page("Classes", "/html/classes.html", "iconurl"),
  new Page("Teachers", "/html/teachers.html", "iconurl"),
  new Page("Parties", "/html/parties.html", "iconurl"),
  new Page("Radio City", "/html/radio-city.html", "iconurl"),
  new Page("Gallery", "/html/gallery.html", "iconurl"),
  new Page("Contact", "/html/contact.html", "iconurl"),
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
    const content = reactive({ data: null });
    const results = reactive({ data: [] });
    getSheetData()
      .then((data) => (content.data = data))
      .catch((err) => alert(err));
    function searchSite(input) {
      results.data = [new Hit("Higgeldy Piggeldy", "link.html")];
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
App.component("carousel", carousel);
App.component("teacher", teacherCard);
App.component("instrument-accordion", instrumentComponent);
App.component("class-filter", classFilter);
App.component("special-class", specialClass);

App.mount("#vue_app");

//////////////////////////////

function getSheetData() {
  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      const { data, err } = e.data;
      if (err) reject(err);
      else if (!err && data) resolve(data);
      else reject(new Error("No Data Returned"));
    };
    worker.postMessage({ mode: "load" });
  });
}
