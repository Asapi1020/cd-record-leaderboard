<script setup lang="ts">
import { toString as convertToString } from "@asp1020/type-utils";
import { CDAPIClient } from "@this/lib/apiClient";
import { throwInvalidParameterError } from "@this/lib/domain/ErrorHandler";
import { PERK_LIST, perkData } from "@this/lib/domain/kf";
import type { Record, SteamAccount, UserStats } from "@this/lib/type";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useDisplay } from "vuetify/lib/framework.mjs";
import RecordTable from "../components/RecordTable.vue";

const apiClient = new CDAPIClient();
const route = useRoute();

const playerData = ref<SteamAccount | null>(null);
const records = ref<Record[]>([]);
const page = ref<number>(1);
const isVictory = ref<boolean>(false);
const totalRecordsNum = ref<number>(0);
const stats = ref<UserStats[]>([]);
const statsForEachPerk = ref<{ [perk: string]: UserStats[] }>({});
const mdAndUp = useDisplay().mdAndUp;
const PER_PAGE = 20;

const getPlayerData = async () => {
	try {
		const steamID =
			convertToString(route.params.id) ?? throwInvalidParameterError("steamID");
		const fetchedPlayerData = await apiClient.getPlayerData([steamID]);
		if (fetchedPlayerData.length === 0 || fetchedPlayerData[0].id !== steamID) {
			throw new Error("Player not found");
		}

		playerData.value = fetchedPlayerData[0];
	} catch (error) {
		console.error(error);
	}
};

const getPlayerStats = async () => {
	try {
		const steamID =
			convertToString(route.params.id) ?? throwInvalidParameterError("steamID");
		const fetchedPlayerStats = await apiClient.getPlayerStats(steamID);
		if (fetchedPlayerStats.length === 0) {
			throw new Error("Player stats not found");
		}
		stats.value = fetchedPlayerStats;
		setupStats();
	} catch (error) {
		console.error(error);
	}
};

const getPlayerRecords = async () => {
	try {
		records.value = [];
		const steamID =
			convertToString(route.params.id) ?? throwInvalidParameterError("steamID");
		const fetchedRecords = await apiClient.getPlayersRecords(
			steamID,
			page.value,
			isVictory.value,
		);
		[records.value, totalRecordsNum.value] = fetchedRecords;
	} catch (error) {
		console.error(error);
	}
};

const setupStats = () => {
	statsForEachPerk.value = stats.value.reduce<{ [perk: string]: UserStats[] }>(
		(acc, stat) => {
			if (!acc[stat.perkClass]) {
				acc[stat.perkClass] = [];
			}
			acc[stat.perkClass].push(stat);
			return acc;
		},
		{},
	);
};

const orderedPerks = computed(() => {
	return PERK_LIST.map((perk) =>
		Object.keys(statsForEachPerk.value).find(
			(key) => key.toLowerCase() === perk.toLowerCase(),
		),
	).filter((perk) => perk !== undefined);
});

const onPageChange = (newPage: number) => {
	page.value = newPage;
	getPlayerRecords();
};

onMounted(() => {
	getPlayerData();
	getPlayerStats();
	getPlayerRecords();
});

watch(() => [isVictory.value], getPlayerRecords);
</script>

<template>
	<v-main class="custom-main">
		<v-container>
			<v-row>
				<v-col cols="12">
					<v-card class="dark-red-background">
						<v-card-title class="flex" v-if="playerData">
							<img :src="`https://avatars.cloudflare.steamstatic.com/${playerData.avatarHash}_full.jpg`" alt="steam avatar" class="inline-image">
							{{ playerData.name }}
							<a :href="playerData.url" target="_blank" rel="noopener noreferrer" class="steam-link">
								<img 
									src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png" 
									alt="steam logo" 
									class="inline-image link-image"
								/>
							</a>
						</v-card-title>
						<div v-else>
							<v-progress-circular indeterminate color="primary" class="mx-auto my-2 ml-4 mr-4"></v-progress-circular>
							Loading player data...
						</div>
					</v-card>
				</v-col>
				<v-col cols="12">
					<v-card>
						<v-card-title>
							Player Stats
						</v-card-title>
						<v-card-text v-if="stats.length>0">
							<table>
								<thead>
									<tr>
										<th>PERK</th>
										<th>TOTAL</th>
										<th v-for="perkClass in orderedPerks" :key="perkClass" class="centered">
											<img :src="perkData[perkClass.toLowerCase()][1]" :alt="perkClass" class="inline-image">
										</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Damage Dealt</td>
										<td class="number">
											{{ stats.reduce((sum, stat) => sum + stat.damageDealt, 0).toLocaleString() }}
										</td>
										<td v-for="perkClass in orderedPerks" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.damageDealt, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Damage Taken</td>
										<td class="number">
											{{ stats.reduce((sum, stat) => sum + stat.damageTaken, 0).toLocaleString() }}
										</td>
										<td v-for="perkClass in orderedPerks" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.damageTaken, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Heals Given</td>
										<td class="number">
											{{ stats.reduce((sum, stat) => sum + stat.healsGiven, 0).toLocaleString() }}
										</td>
										<td v-for="perkClass in orderedPerks" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.healsGiven, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Heals Received</td>
										<td class="number">
											{{ stats.reduce((sum, stat) => sum + stat.healsReceived, 0).toLocaleString() }}
										</td>
										<td v-for="perkClass in orderedPerks" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.healsReceived, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Dosh Earned</td>
										<td class="number">
											{{ stats.reduce((sum, stat) => sum + stat.doshEarned, 0).toLocaleString() }}
										</td>
										<td v-for="perkClass in orderedPerks" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.doshEarned, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Hit Accuracy</td>
										<td class="number">
											{{
												stats.reduce((sum, stat) => sum + stat.shotsFired, 0) === 0
													? "0%"
													: ((stats.reduce((sum, stat) => sum + stat.shotsHit, 0) /
														stats.reduce((sum, stat) => sum + stat.shotsFired, 0)) *
														100
														).toFixed(2) + "%"
											}}
										</td>
										<td v-for="perkClass in orderedPerks" :key="perkClass" class="number">
											{{ 
												statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.shotsFired, 0) === 0 
													? "0%" 
													: ((statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.shotsHit, 0) /
														statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.shotsFired, 0)) * 100
													).toFixed(2) + "%" 
											}}
										</td>
									</tr>
									<tr>
										<td>HS Accuracy</td>
										<td class="number">
											{{
												stats.reduce((sum, stat) => sum + stat.shotsHit, 0) === 0
													? "0%"
													: ((stats.reduce((sum, stat) => sum + stat.headShots, 0) /
														stats.reduce((sum, stat) => sum + stat.shotsHit, 0)) *
														100
														).toFixed(2) + "%"
											}}
										</td>
										<td v-for="perkClass in orderedPerks" :key="perkClass" class="number">
											{{ 
												statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.shotsHit, 0) === 0 
													? "0%" 
													: ((statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.headShots, 0) /
														statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.shotsHit, 0)) * 100
													).toFixed(2) + "%" 
											}}
										</td>
									</tr>
									<tr>
										<td>Deaths</td>
										<td class="number">
											{{ stats.reduce((sum, stat) => sum + stat.deaths, 0).toLocaleString() }}
										</td>
										<td v-for="perkClass in orderedPerks" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.deaths, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Match Count</td>
										<td class="number">
											{{ stats.length.toLocaleString() }}
										</td>
										<td v-for="perkClass in orderedPerks" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].length.toLocaleString() }}
										</td>
									</tr>
								</tbody>
							</table>
						</v-card-text>
						<div v-else>
							<v-progress-circular indeterminate color="primary" class="mx-auto my-2 ml-4 mr-4"></v-progress-circular>
							Loading player stats...
						</div>
					</v-card>
				</v-col>
			</v-row>
		</v-container>

		<v-card class="dark-red-background">
			<v-card-title>Records</v-card-title>
		</v-card>
		<v-checkbox 
			v-model="isVictory" 
			label="Show Victory Only" 
			density="compact"
			hide-details="auto"
		/>
		<RecordTable :records="records" v-if="records.length>0" />
		<div v-else>
			<v-progress-circular indeterminate color="primary" class="mx-auto my-4 mr-4"></v-progress-circular>
			Loading records...
		</div>
		<v-pagination v-model="page" :length="Math.ceil(totalRecordsNum / PER_PAGE)" class="text-center mt-4" :totalVisible="mdAndUp ? 9 : 3" @update:modelValue="onPageChange"></v-pagination>
	</v-main>
</template>

<style scoped lang="scss">
.dark-red-background {
    background-color: #8B0000;
    color: white;
}
table th,
table td {
	padding: 4px;
	text-align: left;
}

table td.number {
	text-align: right;
}

.centered {
  text-align: center;
}

.flex {
	display: flex;
	align-items: center;
}

.steam-link {
	margin-left: auto;
}
</style>
