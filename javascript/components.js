"use strict";
const navBar = {
  props: {
    logo: { type: String, default: `/imgs/no-image.png` },
    links: { type: Array, default: () => [] },
    results: { type: Array, default: () => [] },
    map: { type: String, default: "#" },
    phone: { type: String, default: "XXX-XXX-XXXX" },
    address: { type: String, default: "Unlisted" },
    level: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
  },
  emits: ["query", "choose"],
  setup(props, { emit }) {
    const itemOffsetHeight = 34;
    const query = Vue.ref("");
    const open = Vue.ref(true);
    const opening = Vue.ref(false);
    const navBody = Vue.ref(null);
    const navItem = Vue.ref(null);
    const links = Vue.ref(props.links);
    const overflow = Vue.ref([]);
    const permaOpen = Vue.ref(true);
    const resultsCont = Vue.ref(null);
    const scrollMore = Vue.ref(true);
    const resultItem = Vue.ref(null);
    const formSubmit = () => emit("query", query.value);
    const choose = (result) => emit("choose", result);
    const makePhone = (number) => {
      const splitted = number
        .trim()
        .split(/[\s-]+/)
        .map((e) => Number(e.replace(/[()]/g, "")));
      return splitted.join("-");
    };
    const instOpen = () => {
      open.value = true;
      permaOpen.value = true;
    };
    const instClose = () => {
      open.value = false;
      permaOpen.value = false;
    };
    const animOpen = () => (open.value = true);
    const animClose = () => (open.value = false);
    function makeMaskStyle(img) {
      return {
        maskImage: `url(${img})`,
        WebkitMaskImage: `url(${img})`,
        maskSize: "contain",
        maskPosition: "center",
        maskRepeat: "no-repeat",
      };
    }
    function checkFit() {
      const boxHeight = navBody.value.offsetHeight;
      const itemHeight = itemOffsetHeight + 2;
      const totalHeight = itemHeight * props.links.length;
      const diff = boxHeight - totalHeight;
      if (diff > 0) {
        links.value = props.links;
        overflow.value = [];
        return;
      }
      const dontFit = Math.ceil(Math.abs(diff) / itemHeight) + 1;
      links.value = props.links.slice(0, -dontFit);
      overflow.value = props.links.slice(-dontFit);
    }
    function resultScroll() {
      const el = resultsCont.value;
      const scrollBottom = Math.round(
        el.scrollHeight - el.scrollTop - el.clientHeight,
      );
      if (scrollBottom <= 1) scrollMore.value = false;
      else scrollMore.value = true;
    }
    const prefix = () => "../".repeat(props.level);
    Vue.watch(
      () => props.results,
      () => {
        Vue.nextTick(() => {
          if (resultItem.value) resultScroll();
        });
      },
      { deep: true },
    );
    Vue.onMounted(() => {
      checkFit();
      const observer = new ResizeObserver(() => checkFit());
      observer.observe(navBody.value);
    });
    return {
      formSubmit,
      choose,
      animOpen,
      animClose,
      makePhone,
      instOpen,
      instClose,
      makeMaskStyle,
      resultScroll,
      prefix,
      open,
      opening,
      query,
      props,
      navBody,
      navItem,
      links,
      overflow,
      permaOpen,
      resultsCont,
      scrollMore,
      resultItem,
    };
  },
  template: `
  <div class="nav-bar" @click="instOpen" :class="{ 'nav-bar-show': permaOpen || open, 'nav-bar-away': !permaOpen && !open}">
    <div class="nav-bar-close" @click.stop="instClose">
      <div class="control-icon" :style="makeMaskStyle(prefix() + 'webicons/navbar-icons/close.png')"></div>
    </div>
    <div class="nav-bar-open" @click.stop="instOpen">
      <div class="control-icon" :style="makeMaskStyle(prefix() + 'webicons/navbar-icons/right-arrow.png')"></div>
    </div>
    <div class="nav-bar-header">
      <img :src="props.logo" alt="Music and Art Academy Logo" class="nav-bar-logo" loading="lazy">
    </div>
    <div class="nav-bar-body">
      <div class="nav-bar-section nav-bar-list" ref="navBody">
        <div class="nav-bar-item" ref="navItem" v-for="link in links" :key="link.url" @mouseenter="animOpen" @mouseleave="animClose">
          <a :href="link.url === 'index.html' ? prefix() + link.url : prefix() + 'html/' + link.url">{{link.name}}
          <div class="nav-bar-item-icon">
            <div :style="makeMaskStyle(prefix() + link.icon)" class="nav-bar-item-icon-mask"></div>
          </div>
          </a>
        </div>
        <div class="nav-bar-dropdown nav-bar-item" v-if="overflow.length > 0" @mouseenter="animOpen" @mouseleave="animClose">
          <a>More ➤</a>
          <div class="nav-bar-item-icon">
            <div :style="makeMaskStyle(prefix() + 'webicons/navbar-icons/next.png')" class="nav-bar-item-icon-mask"></div>
          </div>
          <div class="dropdown-body">
              <div class="nav-dropdown-item" v-for="link in overflow" :key="link.url">
                <a :href="link.url === 'index.html' ? prefix() + link.url : prefix() + 'html/' + link.url">{{link.name}}</a>
              </div>
          </div>
        </div>
      </div>
      <div class="nav-bar-section nav-bar-search" data-bs-toggle="modal" data-bs-target="#search-modal">
        <div class="fake-search" id="sham-input">Search...</div>
        <div class="search-icon" :style="makeMaskStyle(prefix() + 'webicons/navbar-icons/search.png')"></div>
      </div>
      <div class="nav-bar-section nav-bar-extras">
        <div class="extras-text extras-section">
          <a :href="'tel:' + makePhone(props.phone)">{{props.phone}}</a>
          <p>
            34 Main St<br>(Rear Building)<br>Holmdel, NJ 07733
          </p>
        </div>
        <div class="extras-map extras-section">
          <a :href="props.map" target="_blank">
            <img :src="prefix() + 'map.png'" loading="lazy" class="img-fluid">
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="landscapeBar">
    <div class="menu">
      <div class="buttonContainer">
      <div class="button" :style="makeMaskStyle(prefix() + 'webicons/more.png')"></div>
      </div>
      <div class="items">
        <a class="item" v-for="link in props.links" :href="link.url === 'index.html' ? prefix() + link.url : prefix() + 'html/' + link.url">{{link.name}}</a>
      </div>
    </div>
    <div class="icons">
      <div class="icon search-icon" :style="makeMaskStyle(prefix() + 'webicons/navbar-icons/search.png')" data-bs-toggle="modal" data-bs-target="#search-modal"></div>
      <a :href="prefix() + 'html/' + 'contact.html'">
        <div class="icon phone-icon" :style="makeMaskStyle(prefix() + 'webicons/navbar-icons/phone-call.png')"></div>
      </a>
      <a :href="props.map" target="_blank">
        <div class="icon address-icon" :style="makeMaskStyle(prefix() + 'webicons/location.png')"></div>
      </a>
    </div>
  </div>
  <!--modal-->
  <div class="search-modal modal fade" tabindex="-1" id="search-modal" aria-labelledby="searchModalLabel">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-body">
          <form @submit.prevent="formSubmit">
            <input v-model="query" id="search-input" name="search-input" placeholder="Search..." maxlength="30">
            <label for="search-input" :style="makeMaskStyle(prefix() + 'webicons/navbar-icons/search.png')"></label>
          </form>
          <div class="search-results" :class="{'scrollMore': scrollMore, 'loading': props.loading, 'hasResults': props.results.length > 0}" ref="resultsCont" @scroll="resultScroll">
            <ul>
              <li v-for="result in props.results" @click="choose(result)" class="result" ref="resultItem">
                <a target="_blank">
                  <p>
                    <span class="preamble">...{{result.preamble}}</span>
                    <span class="match">{{result.exact}}</span>
                    <span class="postamble">{{result.postamble}}...</span>
                  </p>
                  <p>{{result.url}}</p>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
}; //navBar done
const footer = {
  props: {
    icons: { type: Array, default: () => [] },
    copyright: { type: String, default: "" },
  },
  setup(props) {
    return { props };
  },
  template: `
  <footer class="footer-icons">
      <div class="footer-icons-container">
       <div class="footer-icons-icon" v-for="icon in props.icons">
         <a :href="icon.url" target="_blank">
           <img :src="icon.icon" :alt="icon.alt" loading="lazy">
         </a>
       </div>
      </div>
      <div class="footer-copyright" v-if="props.copyright">
        <p>{{props.copyright}}</p>
      </div>
  </footer>
  `,
}; //footer done
const imgCarousel = {
  props: {
    images: { type: Array, default: () => [] },
  },
  setup(props) {
    const items = Vue.ref([]);
    const setItem = (el, i) => {
      if (el) items.value[i] = el;
    };
    let current;
    let index = Math.round(props.images.length / 2);
    let scrollBlock = {
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    };
    Vue.onMounted(async () => {
      const hash = window.location.hash;
      if (hash) index = Number(hash.slice(1));
      const target = items.value[index];
      if (target) {
        target.scrollIntoView(scrollBlock);
        target.classList.add("activeE")
      }
    });
    function setCurrent(i) {
      current = document.querySelector(`[id="${i}"]`);
      index = i;
    }
    function move(p) {
      if (index <= props.images.length - 1 && index >= 0) index += p;
      index = Math.max(Math.min(props.images.length - 1, index), 0);
      const actives = document.querySelectorAll(".activeE");
      actives.forEach(e => e.classList.remove("activeE"));
      window.location.hash = index;
    }
    return { props, items, setItem, setCurrent, move };
  },
  template: `
  <div class="css-carousel-container">
    <div class="css-carousel">
      <a 
        v-for="(image, i) in props.images"
        :key="i"
        :href="'#' + i"
        @click="setCurrent(i)"
      >
        <div class="item" :id="i" :ref="el => setItem(el, i)">
          <img :src="image" loading="lazy" :alt="image" />
        </div>
      </a>
    <div>
    <div class="css-control-buttons">
      <div class="forward" @click="move(1)">
        <div class="icon"></div>
      </div>
      <div class="backward" @click="move(-1)">
        <div class="icon"></div>
      </div>
    </div>
  </div>
  `,
};
const teacherCard = {
  props: {
    name: { type: String, default: "" },
    photo: { type: String, default: "" },
    blurb: { type: String, default: "" },
    specs: { type: Array, default: () => [] },
  },
  emits: ["search-class"],
  setup(props, { emit }) {
    const searchClass = () => emit("search-class", props.name);
    const photo = (url) => (!url ? "/imgs/no-image.png" : url.trim());
    function name(input) {
      return input.trim().toLowerCase().split(/\s+/g).join("");
    }
    return { props, searchClass, photo, name };
  },
  template: `
  <div class="teacher-container">
  <div class="teacher-card">
    <div class="teacher-img teacher-section">
      <img :src="photo(props.photo)" :alt="props.name" loading="lazy">
    </div>
    <div class="teacher-section teacher-body">
      <div class="teacher-header">
        <div>{{props.name}}</div>
        <div class="teacher-chips">
          <ul>
            <li v-for="spec in props.specs" class="chip">
              {{spec}}
            </li>
          </ul>
        </div>
      </div>
      <div class="teacher-main">
        <div class="teacher-blurb">
          {{props.blurb}}
          <div class="see-more" data-bs-toggle="modal" :data-bs-target="'#' + name(props.name) + 'about-modal'"></div>
        </div>
        <div class="teacher-actions">
          <p class="action-button" @click="searchClass">See the Schedule</p>
          <a class="action-button" href="/html/contact.html">Schedule a Class</a>
        </div>
      </div>
    </div>
  </div>
  </div>
  <!--modal-->
  <div class="teacher-modal modal fade" tabindex="-1" :id="name(props.name) + 'about-modal'" aria-labelledby="aboutModalLabel">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{props.name}}</h5>
          <div class="teacher-chips">
            <ul>
              <li v-for="spec in props.specs" class="chip">
                {{spec}}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-body">
          {{blurb}}
        </div>
      </div>
    </div>
  </div>
  `,
}; //teacherCard done
const instrumentComponent = {
  props: {
    instrument: { type: Object, default: null },
  },
  setup(props) {
    return { props };
  },
  template: `
  <div class="accordion" :id="props.name + 'accordionID'" v-if="props.instrument">
    <div class="accordion-item">
      <h2 class="accordion-header">
       <button class="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
          {{props.instrument.name}}
       </button>
     </h2>
     <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
       <div class="accordion-body">
         <table>
         <thead>
           <tr>
              <th scope="col">Teachers</th>
              <th scope="col">Days</th>
              <th scope="col">Times</th>
           </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in props.instrument.teachers">
              <th scope="row">{{teacher.name}}</th>
              <td>
                <p v-for="day in teacher.days">{{day}}</p>
              </td>
              <td>
                <p v-for="time in teacher.times">{{time}}</p>
              </td>
            </tr>
          </tbody>
         </table>
       </div>
     </div>
   </div>
  </div>
  `,
}; //instrumentComponent done
const classFilter = {
  props: {
    values: { type: Array, default: () => [] },
  },
  emits: ["select"],
  setup(props, { emit }) {
    const safe = (e) => e.replace(/\s+/g, "");
    const filterObj = props.values.reduce((acc, val) => {
      acc[val] = false;
      return acc;
    }, {});
    const filters = Vue.reactive(filterObj);
    function select() {
      emit("select", filters);
    }
    return { props, safe, select, filters };
  },
  template: `
  <div class="class-filters">
    <div class="fitler-name">Filters:</div>
    <div class="filters">
      <div class="filter" v-for="value in props.values">
        <input type="checkbox" v-model="filters[value]" :name="safe(value)" :id="safe(value)+'filter'" :value="safe(value)" @click="select">
        <label :for="safe(value) + 'filter'">{{value}}</label>
      </div>
    </div>
  </div>
  `,
}; //classFilter done
const specialClass = {
  props: {
    title: { type: String, default: "" },
    dateTime: { type: String, default: "" },
    teacher: { type: String, default: "" },
    text: { type: String, default: "" },
    when: { type: String, default: "" },
  },
  setup(props) {
    return { props };
  },
  template: `
  <div class="special-class">
    <div class="special-class-card">
      <div class="special-class-header">
        {{props.title}}
      </div>
      <div class="special-class-info">
        <p>{{props.dateTime}}</p>
        <p>Teacher: {{props.teacher}}</p>
      </div>
      <div class="special-class-body">
        {{props.text}}
      </div>
      <div class="special-class-foot">
        <div class="special-button">{{props.when}}</div>
      </div>
    </div>
  </div>
  `,
}; //specialClass done
