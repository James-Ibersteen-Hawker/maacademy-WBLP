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
    const query = Vue.ref("");
    const formSubmit = () => emit("query", query.value);
    const choose = (result) => emit("choose", result);
    const makePhone = (number) => {
      // const splitted = number.trim().split(" ").map(e => {e.replace(\(|\))})
      return number;
    };
    const formatLink = (link) => {
      if (typeof link !== "string") return "invalid";
      const newLink = link.trim().toLowerCase().split(/\s+/).join("-");
      return `/html/${newLink}.html`;
    };
    const getLink = (link) => {
      if (typeof link !== "string") return "invalid";
      return link.trim().toLowerCase() === "index" ? "Home" : link.trim();
    };
    const showNav = () => {};
    const hideNav = () => {};
    return {
      formSubmit,
      choose,
      query,
      props,
      formatLink,
      getLink,
      showNav,
      hideNav,
      makePhone,
    };
  },
  template: `
  <div class="nav-bar">
    <div class="nav-bar-close" @click="showNav">-></div>
    <div class="nav-bar-open" @click="hideNav">X</div>
    <div class="nav-bar-header">
      <img :src="props.logo" alt="Music and Art Academy Logo" class="nav-bar-logo">
    </div>
    <div class="nav-bar-body">
      <div class="nav-bar-section nav-bar-list">
        <div class="nav-bar-item" v-for="link in props.links">
          <a :href="formatLink(link)" target="_blank">{{getLink(link)}}</a>
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
            <img src="/imgs/no-image.png">
          </a>
        </div>
      </div>
    </div>
  </div>
  <!--modal-->
  <div class="modal fade" tabindex="-1" id="search-modal" aria-labelledby="searchModalLabel">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Modal title</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
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
};
