import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import PlayerDetails from "./pages/PlayerDetails.vue";
import RecordDetails from "./pages/RecordDetails.vue";
import Records from "./pages/Records.vue";

const routes = [
	{ path: "/", name: "Home", component: Home },
	{ path: "/records", name: "Records", component: Records },
	{ path: "/records/:id", name: "Record", component: RecordDetails },
	{ path: "/players/:id", name: "Player", component: PlayerDetails },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
