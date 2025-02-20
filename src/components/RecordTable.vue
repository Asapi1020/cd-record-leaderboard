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
	<table>
		<thead>
			<tr>
				<th></th>
				<th>Date</th>
				<th>Server</th>
				<th>Result</th>
				<th>Map</th>
				<th>SpawnCycle</th>
				<th>MaxMonsters</th>
				<th>CohortSize</th>
				<th>SpawnPoll</th>
				<th>WaveSizeFakes</th>
				<th>Players</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="record in records" :key="record.id">
				<td>
					<button @click="openRecordDetails(record.id)" class="btn">
						Details
					</button>
				</td>
				<td>{{ new Date(record.matchInfo.timeStamp).toLocaleDateString() }}</td>
				<td>{{ record.matchInfo.isSolo ? "Solo" : record.matchInfo.serverName ?? record.matchInfo.serverIP }}</td>
				<td>{{ record.matchInfo.isVictory ? "Victory" : `Defeat @${record.matchInfo.defeatWave}` }}</td>
				<td>{{ record.matchInfo.mapName }}</td>
				<td>{{ record.matchInfo.CDInfo.spawnCycle }}</td>
				<td>{{ record.matchInfo.CDInfo.maxMonsters }}</td>
				<td>{{ record.matchInfo.CDInfo.cohortSize }}</td>
				<td>{{ record.matchInfo.CDInfo.spawnPoll }}</td>
				<td>{{ record.matchInfo.CDInfo.waveSizeFakes }}</td>
				<td>
					<span v-for="(stat, index) in record.userStats" :key="index">
						<a :href="`/players/${stat.steamID}`" class="player-link">
							{{ stat.playerName ?? stat.steamID }}
						</a>
						<span v-if="index < record.userStats.length - 1">, </span>
					</span>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<style scoped lang="scss">
table {
	width: 100%;
	border-collapse: collapse;
}

table th,
table td {
	padding: 12px;
	border-bottom: 1px solid #555;
	text-align: left;
	max-width: 450px;
}

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

.player-link {
	color: whitesmoke;
	text-decoration: none;
}

.player-link:hover {
	text-decoration: underline;
}
</style>
