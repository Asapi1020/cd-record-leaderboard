<script setup lang="ts">
import { CDAPIClient } from "@this/lib/apiClient";
import { perkData } from "@this/lib/kfClassNameResolver";
import type { Record, SteamAccount, UserStats } from "@this/lib/type";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
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

const getPlayerData = async () => {
	try {
		const steamID = route.params.id;
		if (typeof steamID !== "string") {
			throw new Error("Invalid record ID");
		}

		const fetchedPlayerData = await apiClient.getPlayerData([steamID]);
		if (fetchedPlayerData.length === 0 || fetchedPlayerData[0].id !== steamID) {
			throw new Error("Player not found");
		}

		playerData.value = fetchedPlayerData[0];
	} catch (error) {
		console.error(error);
	}
};

const getPlayerRecords = async (steamID: string) => {
	try {
		const fetchedRecords = await apiClient.getRecords(
			page.value,
			false,
			steamID,
			true,
		);
		[records.value, totalRecordsNum.value] = fetchedRecords;
	} catch (error) {
		console.error(error);
	}
};

const setupStats = (records: Record[]) => {
	const steamID = route.params.id;
	if (typeof steamID !== "string") {
		throw new Error("Invalid record ID");
	}
	const userStats = records.map((record) => {
		const stat = record.userStats.find(
			(userStat) => userStat.steamID === steamID,
		);
		if (!stat) {
			throw new Error("User stats not found");
		}
		return stat;
	});
	stats.value = userStats;

	statsForEachPerk.value = userStats.reduce<{ [perk: string]: UserStats[] }>(
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

onMounted(async () => {
	await getPlayerData();
	if (!playerData.value) {
		console.error("Failed to get player data");
		return;
	}
	await getPlayerRecords(playerData.value.id);

	if (records.value.length === 0) {
		console.error("Failed to get records");
		return;
	}
	setupStats(records.value);
});
</script>

<template>
	<v-main class="custom-main">
		<v-container>
			<v-row v-if="playerData">
				<v-col cols="12">
					<v-card class="dark-red-background">
						<v-card-title>
							<img :src="`https://avatars.cloudflare.steamstatic.com/${playerData.avatarHash}_full.jpg`" alt="steam avatar" class="inline-image">
							{{ playerData.name }}
						</v-card-title>
					</v-card>
				</v-col>
				<v-col v-if="records.length>0" cols="12">
					<v-card>
						<v-card-title>
							Player Stats
						</v-card-title>
						<v-card-text>
							<table>
								<thead>
									<tr>
										<th>PERK</th>
										<th>TOTAL</th>
										<th v-for="perkClass in Object.keys(statsForEachPerk)" :key="perkClass" class="centered">
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
										<td v-for="perkClass in Object.keys(statsForEachPerk)" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.damageDealt, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Damage Taken</td>
										<td class="number">
											{{ stats.reduce((sum, stat) => sum + stat.damageTaken, 0).toLocaleString() }}
										</td>
										<td v-for="perkClass in Object.keys(statsForEachPerk)" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.damageTaken, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Heals Given</td>
										<td class="number">
											{{ stats.reduce((sum, stat) => sum + stat.healsGiven, 0).toLocaleString() }}
										</td>
										<td v-for="perkClass in Object.keys(statsForEachPerk)" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.healsGiven, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Heals Received</td>
										<td class="number">
											{{ stats.reduce((sum, stat) => sum + stat.healsReceived, 0).toLocaleString() }}
										</td>
										<td v-for="perkClass in Object.keys(statsForEachPerk)" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.healsReceived, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Dosh Earned</td>
										<td class="number">
											{{ stats.reduce((sum, stat) => sum + stat.doshEarned, 0).toLocaleString() }}
										</td>
										<td v-for="perkClass in Object.keys(statsForEachPerk)" :key="perkClass" class="number">
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
										<td v-for="perkClass in Object.keys(statsForEachPerk)" :key="perkClass" class="number">
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
										<td v-for="perkClass in Object.keys(statsForEachPerk)" :key="perkClass" class="number">
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
										<td v-for="perkClass in Object.keys(statsForEachPerk)" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].reduce((sum, stat) => sum + stat.deaths, 0).toLocaleString() }}
										</td>
									</tr>
									<tr>
										<td>Match Count</td>
										<td class="number">
											{{ stats.length.toLocaleString() }}
										</td>
										<td v-for="perkClass in Object.keys(statsForEachPerk)" :key="perkClass" class="number">
											{{ statsForEachPerk[perkClass].length.toLocaleString() }}
										</td>
									</tr>
								</tbody>
							</table>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
			<div v-else>
				<v-progress-circular indeterminate color="primary" class="mx-auto my-4 mr-4"></v-progress-circular>
				Loading player data...
			</div>
		</v-container>
		<div v-if="records.length>0">
			<v-card class="dark-red-background">
				<v-card-title>Records</v-card-title>
			</v-card>
			<v-checkbox 
				v-model="isVictory" 
				label="Show Victory Only" 
				density="compact"
				hide-details="auto"
			/>
			<RecordTable :records="isVictory ? records.filter(record => record.matchInfo.isVictory) : records" />
			{{ isVictory }}
		</div>
		<v-container v-else-if="playerData">
			<v-progress-circular indeterminate color="primary" class="mx-auto my-4 mr-4"></v-progress-circular>
			Loading records...
		</v-container>
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
</style>
