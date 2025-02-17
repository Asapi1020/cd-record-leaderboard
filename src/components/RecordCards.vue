<script setup lang="ts">
import type { Record } from "@this/lib/type";
import { useRouter } from "vue-router";

defineProps<{ records: Record[] }>();

const router = useRouter();

const navigateTo = (path: string) => {
	router.push(path);
};

const openRecordDetails = (recordID: string) => {
	navigateTo(`/records/${recordID}`);
};
</script>

<template>
	<v-card v-for="record in records" :key="record.id" class="mb-4">
		<v-card-title>
			{{ record.matchInfo.isVictory ? "Victory" : `Defeat @${record.matchInfo.defeatWave}` }}
		</v-card-title>
		<v-card-text>
			<div class="mb-2">
				<span>{{ record.matchInfo.isSolo ? "Solo" : record.matchInfo.serverName ?? record.matchInfo.serverIP }}</span>
			</div>
			<h3 class="mb-2">{{ record.matchInfo.mapName }}</h3>
			<div class="mb-2">
				<span>SpawnCycle={{ record.matchInfo.CDInfo.spawnCycle }}</span><br>
				<span>MaxMonsters={{ record.matchInfo.CDInfo.maxMonsters }}</span><br>
				<span>CohortSize={{ record.matchInfo.CDInfo.cohortSize }}</span><br>
				<span>SpawnPoll={{ record.matchInfo.CDInfo.spawnPoll }}</span><br>
				<span>WaveSizeFakes={{ record.matchInfo.CDInfo.waveSizeFakes }}</span><br>
			</div>
			<div class="mb-2">
				<span>Players</span><br>
				<span v-for="(stat, index) in record.userStats" :key="index">
					{{ stat.playerName ?? stat.steamID }}
					<span v-if="index < record.userStats.length - 1">, </span>
				</span>
			</div>
			<button @click="openRecordDetails(record.id)" class="btn">
				Details
			</button>
		</v-card-text>
	</v-card>
</template>

<style scoped lang="scss">
.btn {
  background-color: #8B0000 ;
  color: white;
  border: 1px solid #600000;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
.btn:hover {
  background-color: #A52A2A;
}
</style>
