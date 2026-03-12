"use strict";
const { createApp, ref, reactive } = Vue;
const worker = new Worker(`/javascript/worker.js`, { type: "module" });
const pages = [
  "Index",
  "About Us",
  "Classes",
  "Teachers",
  "Parties",
  "Radio City",
  "Gallery",
  "Contact",
];
class Hit {
  constructor(match, url) {
    this.match = match;
    this.url = url;
  }
}
const App = createApp({
  setup() {
    const content = reactive({ data: null });
    const results = reactive({ data: [] });
    getSheetData()
      .then((data) => (content.data = data))
      .catch((err) => alert(err));
    function searchSite(input) {
      results.data = [new Hit("Higgeldy Piggeldy", "link.html")];
    }
    function runSelection(selection) {
      alert(selection.match)
    }
    return { searchSite, content, pages, results, runSelection };
  },
});
App.component("nav-bar", navBar);
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
