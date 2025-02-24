<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

enum GameLength {
	Short = 0,
	Medium = 1,
	Long = 2,
}

enum Difficulty {
	Normal = 0,
	Hard = 1,
	Suicidal = 2,
	HellOnEarth = 3,
}

const cycleName = ref<string>("");
const gameLength = ref<number>(GameLength.Long);
const difficulty = ref<number>(Difficulty.HellOnEarth);
const waveSizeFakes = ref<number>(12);
const waveNum = ref<number>(0);
const isTotal = ref<boolean>(false);
const cycleDefs = ref<string[]>([]);
const analysis = ref<{ [key: string]: number }>({});

const getCycleName = () => {
	const cycleParam = route.params.name;
	if (typeof cycleParam === "string") {
		cycleName.value = cycleParam;
	} else {
		console.error("Invalid cycle name");
	}
};

const fetchCycleDefs = async () => {
	try {
		const response = await fetch("/cycles.json");
		cycleDefs.value = await response.json();
	} catch (error) {
		console.error("Failed to load cycles.json", error);
	}
};

onMounted(async () => {
	getCycleName();
	await fetchCycleDefs();
});
</script>
<template>
	<v-main class="custom-main">
		
	</v-main>	
</template>
<style scoped lang="scss"></style>
