import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import config from "../firebase";
import firebase from "firebase";
require("material-design-icons/iconfont/material-icons.css");

firebase.initializeApp(config);
firebase.analytics();

Vue.config.productionTip = false;

Vue.prototype.$eventBus = new Vue();

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount("#app");
