const navBar = {
  props: {
    links: { type: Array, default: () => [] },
  },
  emits: ["query"],
  setup(props, { emit }) {
    const query = Vue.ref("");
    function input(e) {
      query.value = e.target.value;
      emit("query", query.value);
    }
    return { input, props };
  },
  template: `
  <ul>
  <li v-for="link in props.links">{{link}}</li>
  </ul>
  `,
};
