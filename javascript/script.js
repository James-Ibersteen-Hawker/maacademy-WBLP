"use strict";
const { createApp, ref, reactive } = Vue;
const worker = new Worker(`${window.location.origin}/javascript/worker.js`, {type: "module"});
const pages = [
  "about-us",
  "classes",
  "contact",
  "gallery",
  "parties",
  "radio-city",
  "teachers",
  "index",
];
const App = createApp({
  setup() {
    const content = reactive({ data: null });
    getSheetData().then((data) => (content.data = data)).catch(err => alert(err));
    const query = ref(" ");
    const handleQuery = (val) => (query.value = val);
    return { query, handleQuery, content };
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
