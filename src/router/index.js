import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
const Table = () => import("../views/Table.vue");
const PrepareGame = () => import("../views/PrepareGame.vue");

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/prepare/:id",
        name: "prepare-game",
        component: PrepareGame,
    },
    {
        path: "/table/:tableId/player/:playerId",
        name: "table",
        component: Table,
    },
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
});

export default router;
