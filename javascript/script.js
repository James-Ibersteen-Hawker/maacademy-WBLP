"use strict";
const { createApp, ref, reactive } = Vue;
const pages = ["about-us", "classes", "contact", "gallery", "parties", "radio-city", "teachers", "index"]
const App = createApp({
    setup() {
        const content = reactive({data: null})
        const query = ref(" ");
        const handleQuery = (val) => query.value = val;
        return { query, handleQuery };
    }
});
App.component("nav-bar", navBar);
App.mount("#vue_app");
