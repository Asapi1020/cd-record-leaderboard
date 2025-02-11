<script setup lang="ts">
import { CDAPIClient } from "@this/lib/apiClient";
import type { Record } from "@this/lib/type";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const apiClient = new CDAPIClient();
const route = useRoute();
const router = useRouter();

const PER_PAGE = 20;
const page = computed(() => (route.query.page ? Number(route.query.page) : 1));

const records = ref<Record[]>([]);
const totalRecordsNum = ref<number>(0);
const isLoading = ref<boolean>(false);

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
		const fetchedRecords = await apiClient.getRecords(page.value);
		[records.value, totalRecordsNum.value] = fetchedRecords;
	} catch (error) {
		console.error(error);
	} finally {
		isLoading.value = false;
	}
};

onMounted(getRecords);
watch(() => route.query.page, getRecords);
</script>

<template>
	<v-main style="min-height: 300px; margin-left: 20px; margin-top: 20px; margin-right: 20px">
		<div class="table-container mx-4">
			<div v-if="isLoading" class="d-flex justify-center my-4">
                <v-progress-circular
                    indeterminate
                    color="primary"
                ></v-progress-circular>
            </div>
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
							<td>{{ record.matchInfo.isVictory ? "Win" : `Defeat @${record.matchInfo.defeatWave}` }}</td>
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
				<v-pagination v-model="page" :length="Math.ceil(totalRecordsNum / PER_PAGE)" class="text-center mt-4" :totalVisible="9" @update:modelValue="onPageChange"></v-pagination>
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
</style>
