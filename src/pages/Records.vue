<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Record } from '@this/lib/type';
import { CDAPIClient } from '@this/lib/apiClient';

const apiClient = new CDAPIClient();

const headers = ref([
	{title: "Date", key: "timeStamp"},
	{title: "Server", key: "server"},
	{title: "Result", key: "result"},
	{title: "Map", key: "map"},
	{title: "SpawnCycle", key: "sc"},
	{title: "MaxMonsters", key: "mm"},
	{title: "CohortSize", key: "cs"},
	{title: "SpawnPoll", key: "sp"},
	{title: "WaveSizeFakes", key: "wsf"},
	{title: "Players", key: "players"}
]);
const players = ref<Record[]>([]);

onMounted(async () => {
	const records = await apiClient.getRecords(0);
	players.value = records.reverse();
});
</script>

<template>
	<v-data-table
		:headers="headers"
		:items="players"
		class="mt-16"
		dark
	>
		<template v-slot:item.timeStamp="{ item }">
			<span>{{ item.matchInfo.timeStamp.split(" - ")[0] }}</span>
		</template>
		<template v-slot:item.server="{ item }">
			<span>{{ item.matchInfo.isSolo ? "Solo" : item.matchInfo.serverName ?? item.matchInfo.serverIP }}</span>
		</template>
		<template v-slot:item.result="{ item }">
			<span>{{ item.matchInfo.isVictory ? "Win" : `Defeat @${item.matchInfo.defeatWave}` }}</span>
		</template>
		<template v-slot:item.map="{ item }">
			<span>{{ item.matchInfo.mapName }}</span>
		</template>
		<template v-slot:item.sc="{ item }">
			<span>{{ item.matchInfo.CDInfo.spawnCycle }}</span>
		</template>
		<template v-slot:item.mm="{ item }">
			<span>{{ item.matchInfo.CDInfo.maxMonsters }}</span>
		</template>
		<template v-slot:item.cs="{ item }">
			<span>{{ item.matchInfo.CDInfo.cohortSize }}</span>
		</template>
		<template v-slot:item.sp="{ item }">
			<span>{{ item.matchInfo.CDInfo.spawnPoll }}</span>
		</template>
		<template v-slot:item.wsf="{ item }">
			<span>{{ item.matchInfo.CDInfo.waveSizeFakes }}</span>
		</template>
		<template v-slot:item.players="{ item }">
			<span v-for="(stat, index) in item.userStats" :key="index">
				{{ stat.playerName ?? stat.steamID }}
			<span v-if="index < item.userStats.length - 1">, </span>
		</span>
		</template>
	</v-data-table>
</template>

<style scoped lang="scss">
</style>
