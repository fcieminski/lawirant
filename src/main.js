import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import config from "../firebase";
import firebase from "firebase";
import '@/index.scss'

firebase.initializeApp(config);
firebase.analytics();

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
