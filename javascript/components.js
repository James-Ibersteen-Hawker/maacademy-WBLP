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
    <div class="nav-bar-close"></div>
    <div class="nav-bar-header">
      <img :src="props.logo" alt="Music and Art Academy Logo" class="nav-bar-logo">
    </div>
    <div class="nav-bar-body">
      <div class="nav-bar-item" v-for="link in props.links">
        <a :href="formatLink(link)" target="_blank">{{getLink(link)}}</a>
      </div>
    </div>
  </div>`,
};
