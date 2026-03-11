const navBar = {
  props: {
    logo: {
      type: String,
      default: `/imgs/no-image.png`,
    },
    links: { type: Array, default: () => [] },
  },
  emits: ["query"],
  setup(props, { emit }) {
    const query = Vue.ref("");
    function input(e) {
      query.value = e.target.value;
      emit("query", query.value);
    }
    const formatLink = (link) => {
      if (typeof link !== "string") return "invalid";
      const newLink = link.trim().toLowerCase().split(/\s+/).join("-")
      return `/html/${newLink}.html`
    }
    const getLink = (link) => {
      if (typeof link !== "string") return "invalid";
      return link.trim().toLowerCase() === "index" ? "Home" : link.trim();
    }
    return { input, query, props, formatLink, getLink };
  },
  template: `
  <div class="nav-bar">
    <div class="nav-bar-close">-></div>
    <div class="nav-bar-open">X</div>
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
        <div class="fake-search" id="search-input" data-bs-toggle="modal" data-bs-target="#search-modal">Search...</div>
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
          <form>
            <label for="search-input">Search Icon</label>
            <input v-model="query" id="search-input" name="search-input">
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>
  `,
};
