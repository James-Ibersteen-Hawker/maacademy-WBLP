"use strict";
const navBar = {
  props: {
    logo: { type: String, default: `/imgs/no-image.png` },
    links: { type: Array, default: () => [] },
    results: { type: Array, default: () => [] },
    map: { type: String, default: "#" },
    phone: { type: String, default: "XXX-XXX-XXXX" },
    address: { type: String, default: "Unlisted" },
  },
  emits: ["query", "choose"],
  setup(props, { emit }) {
    const animLength = 200;
    let currentTimeout = null;
    const query = Vue.ref("");
    const open = Vue.ref(true);
    const opening = Vue.ref(false);
    const formSubmit = () => emit("query", query.value);
    const choose = (result) => emit("choose", result);
    const makePhone = (number) => {
      const splitted = number
        .trim()
        .split(/[\s-]+/)
        .map((e) => Number(e.replace(/[()]/g, "")));
      return splitted.join("-");
    };
    const animOpen = () => {
      if (currentTimeout) clearTimeout(currentTimeout);
      opening.value = true;
      currentTimeout = setTimeout(
        () => ((open.value = true), (currentTimeout = null)),
        animLength,
      );
    };
    const animClose = () => {
      if (currentTimeout) clearTimeout(currentTimeout);
      opening.value = false;
      currentTimeout = setTimeout(
        () => ((open.value = false), (currentTimeout = null)),
        animLength,
      );
    };
    const instOpen = () => (open.value = true);
    const instClose = () => (open.value = false);
    function makeMaskStyle(img) {
      return {
        maskImage: `url(${img})`,
        WebkitMaskImage: `url(${img})`,
        maskSize: 'contain',
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
      }
    }
    return {
      formSubmit,
      choose,
      animOpen,
      animClose,
      makePhone,
      instOpen,
      instClose,
      makeMaskStyle,
      open,
      opening,
      query,
      props,
    };
  },
  //anim on icon hover, but if the navbar is clicked, wait for the animation to end and freeze the navbar in place
  template: `
  <div class="nav-bar" @click="instOpen" :class="{ 'nav-bar-show': open, 'nav-bar-away': !open, 'nav-bar-opening': opening, 'nav-bar-closing': !opening }">
    <div class="nav-bar-close" @click="instOpen">-></div>
    <div class="nav-bar-open" @click="instClose">X</div>
    <div class="nav-bar-header">
      <img :src="props.logo" alt="Music and Art Academy Logo" class="nav-bar-logo" loading="lazy">
    </div>
    <div class="nav-bar-body">
      <div class="nav-bar-section nav-bar-list">
        <div class="nav-bar-item" v-for="link in props.links" @mouseenter="animOpen" @mouseleave="animClose">
          <a :href="link.url" target="_blank">{{link.name}}</a>
          <div class="nav-bar-item-icon">
            <div :style="makeMaskStyle(link.icon)" class="nav-bar-item-icon-mask"></div>
          </div>
        </div>
      </div>
      <div class="nav-bar-section nav-bar-search">
        <div class="search-icon">Search Icon</div>
        <div class="fake-search" id="sham-input" data-bs-toggle="modal" data-bs-target="#search-modal">Search...</div>
      </div>
      <div class="nav-bar-section nav-bar-extras row">
        <div class="col-7 extras-text">
          <a :href="'tel:' + makePhone(props.phone)">{{props.phone}}</a>
          <p>{{props.address}}</p>
        </div>
        <div class="col-5 extras-map">
          <a :href="props.map" target="_blank">
            <img src="/imgs/no-image.png" loading="lazy">
          </a>
        </div>
      </div>
    </div>
  </div>
  <!--modal-->
  <div class="search-modal modal fade" tabindex="-1" id="search-modal" aria-labelledby="searchModalLabel">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-body">
          <form @submit.prevent="formSubmit">
            <label for="search-input">Search Icon</label>
            <input v-model="query" id="search-input" name="search-input" placeholder="...">
            <button type="submit">Search</button>
          </form>
          <div v-if="props.results.length > 0">
            results
            <ul>
              <li v-for="result in props.results" @click="choose(result)">
                <a :href="result.url" target="_blank">{{result.match}}</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
    return { props }
  },
  template: `
  <img v-for="image in props.images" :src="image" loading="lazy">
  `,
}; //find something on codepen or smth, or look at CSS carousels
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
  <div class="teacher-card">
    <div class="teacher-img teacher-section">
      <img :src="photo(props.photo)" :alt="props.name" loading="lazy">
    </div>
    <div class="teacher-section teacher-body">
      <div class="teacher-header">
        <p>{{props.name}}</p>
        <div class="teacher-chips">
          <ul>
            <li v-for="spec in props.specs" class="chip">
              {{spec}}
            </li>
          </ul>
        </div>
      </div>
      <div class="teacher-main row">
        <div class="teacher-blurb col-8">
          {{props.blurb}}
          <div class="see-more" data-bs-toggle="modal" :data-bs-target="'#' + name(props.name) + 'about-modal'">See More</div>
        </div>
        <div class="teacher-actions col-4">
          <p class="action-button" @click="searchClass">See the Schedule</p>
          <a class="action-button" href="/html/contact.html">Schedule a Class</a>
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
          <p data-bs-dismiss="modal">Close</p>
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
  `
}; //specialClass done
