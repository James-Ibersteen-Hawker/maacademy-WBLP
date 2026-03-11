"use strict";
const { createApp, ref } = Vue;
const pages = ["about-us", "classes", "contact", "gallery", "parties", "radio-city", "teachers", "index"]
const App = createApp({
    setup() {
        const query = ref(" ");
        function handleQuery(val) {
            query.value = val;
        }
        return { query, handleQuery };
    }
});
App.component("nav-bar", navBar);
App.mount("#vue_app");
