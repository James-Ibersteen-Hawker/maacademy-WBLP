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
    return { input, query, props };
  },
  template: `<ul>
    <li v-for="link in props.links">
      <a :href="link + '.html'" target="_blank">link</a>
    </li>
    <input type="text" v-model="query" @input="input">
  </ul>`,
};
