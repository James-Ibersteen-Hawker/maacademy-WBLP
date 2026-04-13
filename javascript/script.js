"use strict";
const { createApp, ref, reactive, onMounted } = Vue;
const weblink =
  "https://script.google.com/macros/s/AKfycbzYbswK98IKpxzb4J58kxBMEa1-_HFqBkAAsP1GliMghJXUFuEVA1y9v6WCY3a6uLpe/exec";
const REPONAME = "/maacademy-WBLP";
const [signalTimeout, workerTimeout, dataTimeout] = [20000, 30000, 6];
const hourInMillis = 60 * 60 * 1000;
const keys = { dataKey: "sheetData", searchKey: "searchData" };
const nested = location.pathname.includes("/html/") ? "../" : "./";
const workerName = `${nested}javascript/worker.js`;
const worker = new Worker(workerName, { type: "module" });
const SEP = " \u001f ";
const fuseOptions = {
  keys: ["text"],
  ignoreDiacritics: true,
  includeMatches: true,
  threshold: 0.3,
  ignoreLocation: true,
}
let searchLUT, engine;
let engineStart = () => { };
let engineReject = () => { };
let instrumentFuse, teacherFuse;
const instFuseOp = {
  ignoreDiacritics: true,
  includeMatches: true,
  threshold: 0.3,
  ignoreLocation: true
}
const teachFuseOp = {
  keys: ["name"],
  ignoreDiacritics: true,
  includeMatches: true,
  threshold: 0.3,
  ignoreLocation: true
}
let instStart = () => { };
let instStop = () => { };
let teachStart = () => { };
let teachStop = () => { };
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

//////////////////////////////

const App = createApp({
  setup() {
    const searchString = window.location.search;
    const currentLocation = window.location.href;
    const uPrms = new URLSearchParams(searchString);
    const content = ref({});
    const blank = ref("");
    const loading = ref(false);
    const results = reactive({ data: [] });
    const defaultCarousel = new Array(6).fill(`${nested}imgs/no-image.png`);
    const classResults = Vue.ref(0.1);
    async function setupSearch() {
      const [query, iframe] = [uPrms.get("q"), uPrms.get("iframe")];
      const { pathname, origin } = window.location;
      if (!iframe) {
        searchLUT = await initSearch();
        engine = new Fuse(searchLUT, fuseOptions);
        engineStart();
      }
      await Vue.nextTick();
      if (query) goToSearch(query);
      if (iframe) window.parent.postMessage({ loaded: true, pageName: pathname }, origin);
    }
    async function searchSite(input) {
      loading.value = true;
      engineReject();
      if (!engine) {
        results.data = [];
        await new Promise((resolve, reject) => {
          [engineStart, engineReject] = [resolve, reject];
        })
        searchSite(input);
        engineStart = () => { };
      } else {
        const output = engine.search(input.trim());
        const convertArray = output.map(({ item, matches }) => {
          const { value, indices } = matches[0];
          const properIndexes = indices.filter(([start, end]) => end > start);
          const sortedArr = properIndexes.sort((a, b) => {
            const aDist = a[1] - a[0] + 1;
            const bDis = b[1] - b[0] + 1;
            return bDis - aDist;
          });
          const [start, end] = sortedArr[0];
          const string = value.slice(start, end + 1).replace(/\r?\n/g, "");
          if (string.includes(SEP)) return;
          let [preamble, postamble] = ["", ""];
          const threshold = 5;
          if (start > 0) {
            const begin = Math.max(0, start - threshold);
            preamble = value.slice(begin, start).replace(/\r?\n/g, "");
          }
          postamble = value.slice(start + string.length).replace(/\r?\n/g, "");
          postamble = postamble.split(SEP).join(" ");
          const { page: link } = item;
          return new Hit(string, preamble, postamble, link, value);
        }).filter(Boolean);
        loading.value = false;
        results.data = convertArray;
      }
    }
    function runSelection(e) {
      const {exact, url, value} = e;
      const path = url === "index.html" ? "" : "/html";
      const inRepo = window.location.pathname.includes(REPONAME);
      const repoBase = inRepo ? REPONAME : "";
      const query = JSON.stringify([value, exact.trim()])
      window.location.href = `${window.location.origin}${repoBase}${path}/${url}?q=${encodeURIComponent(query)}`;
    }
    function filterTeachers({ data: filters }) {
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
      if (out.length === elems.length) blank.value = "No Results."
      else blank.value = ""
    }
    function seeSchedule(e) {
      const [name, spec] = e;
      const inRepo = window.location.pathname.includes(REPONAME);
      const repoBase = inRepo ? REPONAME : "";
      const encodedName = encodeURIComponent(name.trim());
      const encodedSpec = encodeURIComponent(spec.trim())
      window.location.href = `${window.location.origin}${repoBase}/html/classes.html?teacher=${encodedName}&accordion=${encodedSpec}`;
    }
    async function accordion() {
      const [accordion, teacher] = [uPrms.get("accordion"), uPrms.get('teacher')];
      if (!accordion) return;
      await Vue.nextTick()
      const elems = Array.from(document.querySelectorAll(".accordion"));
      if (elems.length === 0) return;
      const match = elems.find((e) => e.getAttribute("data-instrument").toLowerCase() === accordion.toLowerCase());
      const number = match.id.slice(11);
      const collapse = match.querySelector(`#collapse${number}`);
      const button = match.querySelector(`#button${number}`);
      collapse.classList.add("show")
      button.classList.remove("collapsed")
      button.setAttribute("aria-expanded", true);
      if (!teacher) return;
      const rows = [...collapse.querySelectorAll("tr")];
      const row = rows.find(el => el.id.toLowerCase().includes(CSS.escape(teacher.toLowerCase())));
      if (!row) return;
      row.classList.add("activeRow");
      row.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    async function searchClasses(e) {
      const { query, option } = e;
      instStop();
      teachStop();
      const accordions = Array.from(document.querySelectorAll(".accordion"));
      if (query === "") {
        classResults.value = 0.1;
        accordions.forEach(e => {
          e.classList.remove("d-none");
          closeAcc(e);
          const rows = e.querySelectorAll("tbody tr");
          rows.forEach(e => e.classList.remove("d-none"))
        });
        return;
      }
      if (option === "Instrument") {
        if (!instrumentFuse) {
          await new Promise((resolve, reject) => {
            [instStart, instStop] = [resolve, reject];
          })
          searchClasses({ query, option });
          instStart = () => { };
        } else {
          const results = instrumentFuse.search(query).map(e => e.item);
          classResults.value = results.length;
          const accs = accordions.filter(e => {
            const instrument = e.getAttribute("data-instrument");
            if (!results.includes(instrument)) {
              e.classList.add("d-none");
              return false;
            }
            else {
              e.classList.remove("d-none");
              return true;
            }
          })
          if (accs.length > 1) return accs.forEach(accordion => closeAcc(accordion))
          openAcc(accs[0])
        }
      } else if (option === "Teacher") {
        if (!teacherFuse) {
          await new Promise((resolve, reject) => {
            [teachStart, teachStop] = [resolve, reject];
          })
          searchClasses({ query, option });
          teachStart = () => { };
        } else {
          const results = teacherFuse.search(query).map(e => e.item);
          classResults.value = results.length;
          const instruments = Array.from(new Set(results.map(e => e.inst)))
          const teachers = Array.from(new Set(results.map(e => e.name.toLowerCase())))
          const accs = accordions.filter(e => {
            const instrument = e.getAttribute("data-instrument");
            if (!instruments.includes(instrument)) {
              e.classList.add("d-none");
              return false;
            }
            else {
              e.classList.remove("d-none");
              return true;
            }
          })
          accs.forEach(accordion => {
            openAcc(accordion);
            const rows = Array.from(accordion.querySelectorAll("tbody tr"));
            rows.forEach(e => e.classList.remove("d-none"));
            rows.forEach(r => {
              const td = r.querySelector("th");
              if (!teachers.includes(td.textContent.toLowerCase())) {
                r.classList.add("d-none")
              }
            })
          })
        }
      }
    }
    function classFuse() {
      const page = window.location.pathname.split("/").at(-1);
      if (page !== "classes.html") return;
      instrumentFuse = new Fuse(content.value.filters, instFuseOp);
      const schedules = content.value.schedules;
      const data = schedules.flatMap(item => item.teachers.map(t => ({ inst: item.name, name: t.name })))
      teacherFuse = new Fuse(data, teachFuseOp);
      instStart();
      teachStart();
    }
    loadData()
      .then((data) => {
        content.value = data;
        setupSearch();
        classFuse();
      })
      .catch((err) => alert(err.message));
    onMounted(async () => {
      await accordion();
    })
    return {
      searchSite,
      runSelection,
      filterTeachers,
      seeSchedule,
      searchClasses,
      content,
      pages,
      results,
      loading,
      weblink,
      currentLocation,
      defaultCarousel,
      blank,
      classResults
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
App.component("class-search", classSearch);
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
function initSearch() {
  return new Promise((resolve, reject) => {
    try {
      const savedLUT = sessionStorage.getItem(keys.searchKey);
      if (savedLUT) return resolve(JSON.parse(savedLUT));
      const path = window.location.pathname;
      const inRepo = path.includes(REPONAME);
      const repoBase = inRepo ? REPONAME : "";
      const max = 4;
      let activeFrames = 0;
      const loadedPages = new Set();
      const iframes = [];
      function* iframe() {
        for (const { url } of pages) {
          const link = url === "index.html" ? url : `html/${url}`;
          const iframe = document.createElement("iframe");
          iframe.src = `${window.location.origin}${repoBase}/${link}?iframe=true`;
          iframe.style.cssText = "width:0; height:0; visibility:hidden; position:absolute;";
          iframe.classList.add("utilIframeJS");
          yield iframe;
        }
      }
      const generator = iframe();
      function newFrame() {
        if (activeFrames >= max) return;
        const { value: frame, done } = generator.next();
        if (!done) {
          document.body.appendChild(frame);
          activeFrames++;
        }
      }
      function doMessage(e) {
        if (!e.data || !e.data.pageName) return;
        const page = e.data.pageName.split("/").at(-1);
        if (loadedPages.has(page)) return;
        loadedPages.add(page);
        activeFrames--;
        const finished = Array.from(document.querySelectorAll(".utilIframeJS"))
          .find(f => f.contentWindow === e.source);
        if (finished) {
          iframes.push([finished.contentDocument, page]);
          finished.remove()
        };
        if (loadedPages.size === pages.length) {
          const data = assembleLUT(iframes);
          sessionStorage.setItem(keys.searchKey, JSON.stringify(data));
          window.removeEventListener("message", doMessage)
          resolve(data);
        } else newFrame();
      }
      window.addEventListener("message", doMessage);
      for (let i = 0; i < max; i++) newFrame();
    } catch (err) {
      reject(err);
    }
  });
}
function goToSearch(q) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentNode?.closest("[data-searchable='false']");
        const script = node.parentNode?.closest("script");
        if (Boolean(parent)) return NodeFilter.FILTER_REJECT;
        if (Boolean(script)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  const [blurb, lower] = JSON.parse(q);
  const searchNodes = blurb.split(SEP).map(e => e.toLowerCase().trim());
  let node, match;
  while ((node = walker.nextNode())) {
    const value = node.nodeValue.toLowerCase().trim();
    if (!value) continue;
    if (!searchNodes.includes(value)) continue;
    match = node;
    break;
  }
  if (Boolean(match) === false) throw new Error("No match!");
  const fragment = document.createDocumentFragment();
  const words = match.nodeValue;
  const start = words.toLowerCase().indexOf(lower.toLowerCase());
  const end = start + lower.length;
  const matchedText = words.slice(start, end).trim();
  if (start === -1) throw new Error("No Match 2!");
  if (start > 0) fragment.appendChild(document.createTextNode(words.slice(0, start)));
  const span = document.createElement("span");
  span.classList.add("searchResult");
  span.textContent = matchedText;
  fragment.appendChild(span);
  if (start < words.length - 1) fragment.appendChild(document.createTextNode(words.slice(end)));
  const accordion = match.parentNode?.closest(".accordion");
  match.parentNode.replaceChild(fragment, match);
  //if accordion
  if (accordion) {
    const number = accordion.id.slice(11);
    const collapse = accordion.querySelector(`#collapse${number}`);
    const button = accordion.querySelector(`#button${number}`);
    collapse.classList.add("show")
    button.classList.remove("collapsed")
    button.setAttribute("aria-expanded", true);
  }
  ///////////
  span.scrollIntoView({ behavior: "smooth", block: "center" });
}
function assembleLUT(iframes) {
  const removed = ["script", "style", "[data-searchable='false']", "img"]
  function getDirectText(el) {
    return Array.from(el.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.nodeValue.trim())
      .filter(Boolean)
      .join(SEP)
  }
  return iframes.flatMap(([doc, page]) => {
    doc.querySelectorAll(removed.join(",")).forEach((e) => e.remove());
    const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
    const results = [];
    let current;
    while ((current = walker.nextNode())) {
      const textContent = getDirectText(current);
      if (textContent) results.push({ page, text: textContent });
    };
    return results;
  });
}
function openAcc(accordion) {
  const number = accordion.id.slice(11);
  const collapse = accordion.querySelector(`#collapse${number}`);
  const button = accordion.querySelector(`#button${number}`);
  collapse.classList.add("show")
  button.classList.remove("collapsed")
  button.setAttribute("aria-expanded", true);
}
function closeAcc(accordion) {
  const number = accordion.id.slice(11);
  const collapse = accordion.querySelector(`#collapse${number}`);
  const button = accordion.querySelector(`#button${number}`);
  collapse.classList.remove("show")
  button.classList.add("collapsed")
  button.setAttribute("aria-expanded", false);
}