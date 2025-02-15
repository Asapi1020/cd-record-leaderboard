<script setup lang="ts">
import { CDAPIClient } from "@this/lib/apiClient";
import type { Record } from "@this/lib/type";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";

const apiClient = new CDAPIClient();
const route = useRoute();
const router = useRouter();
const mdAndUp = useDisplay().mdAndUp;

const PER_PAGE = 20;
const page = computed(() => (route.query.page ? Number(route.query.page) : 1));

const records = ref<Record[]>([]);
const totalRecordsNum = ref<number>(0);
const isLoading = ref<boolean>(false);
const isVictory = ref<boolean>(false);

const onPageChange = (newPage: number) => {
	router.push({ query: { ...route.query, page: newPage } });
};

const navigateTo = (path: string) => {
	router.push(path);
};

const openRecordDetails = (recordID: string) => {
	navigateTo(`/records/${recordID}`);
};

const getRecords = async () => {
	isLoading.value = true;
	try {
		const fetchedRecords = await apiClient.getRecords(
			page.value,
			isVictory.value,
		);
		[records.value, totalRecordsNum.value] = fetchedRecords;
	} catch (error) {
		console.error(error);
	} finally {
		isLoading.value = false;
	}
};

onMounted(getRecords);
watch([() => route.query.page, isVictory], getRecords);
</script>

<template>
	<v-main class="custom-main">
		<div class="table-container mx-4">
			<v-checkbox 
				v-model="isVictory" 
				label="Show Victory Only" 
				density="compact"
				hide-details="auto"
				:class="{ 'mt-4': !mdAndUp }"
			/>
			<div v-if="isLoading" class="d-flex justify-center my-4">
                <v-progress-circular
                    indeterminate
                    color="primary"
                ></v-progress-circular>
            </div>
			<div v-else>
				<v-container v-if="!mdAndUp">
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
				</v-container>
				<div v-else>
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
										{{ stat.playerName ?? stat.steamID }}
										<span v-if="index < record.userStats.length - 1">, </span>
									</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<v-pagination v-model="page" :length="Math.ceil(totalRecordsNum / PER_PAGE)" class="text-center mt-4" :totalVisible="mdAndUp ? 9 : 3" @update:modelValue="onPageChange"></v-pagination>
			</div>
		</div>		
	</v-main>
</template>

<style scoped lang="scss">
.table-container {
  overflow-x: auto;
}

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

.custom-main {
  min-height: 300px;
  margin: 20px;
}

@media (max-width: 600px) {
  .custom-main {
	margin: 0;
  }
}
</style>
