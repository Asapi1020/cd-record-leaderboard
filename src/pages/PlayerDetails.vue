<script setup lang="ts">
import { toString as convertToString } from "@asp1020/type-utils";
import RecordTable from "@this/components/RecordTable.vue";
import UsageBar from "@this/components/UsageBar.vue";
import { CDAPIClient } from "@this/lib/apiClient";
import { COLOR_LIST } from "@this/lib/domain/color";
import { throwInvalidParameterError } from "@this/lib/domain/ErrorHandler";
import {
	PERK_LIST,
	perkColors,
	perkData,
	resolveWeaponData,
} from "@this/lib/domain/kf";
import type { Record, SteamAccount, UserStats } from "@this/lib/type";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useDisplay } from "vuetify/lib/framework.mjs";

const apiClient = new CDAPIClient();
const route = useRoute();

const page = ref<number>(1);
const isVictory = ref<boolean>(false);
const mdAndUp = useDisplay().mdAndUp;
const PER_PAGE = 20;

const playerData = ref<SteamAccount | null>(null);
const isGetPlayerDataError = ref<boolean>(false);

const stats = ref<UserStats[]>([]);
const statsForEachPerk = ref<{ [perk: string]: UserStats[] }>({});
const isGetPlayerStatsError = ref<boolean>(false);

const records = ref<Record[]>([]);
const totalRecordsNum = ref<number>(0);
const isGetPlayerRecordsError = ref<boolean>(false);

const perkUsages = computed(() => {
	return usedCountOrderedPerks.value
		.map((perk) => {
			const perkName = perk?.toLowerCase() ?? "";
			const perkDatum = perkData[perkName];

			return {
				name: perkDatum ? perkDatum[0] : "",
				count: statsForEachPerk.value[perk]?.length ?? 0,
				color: perkColors(perkName),
			};
		})
		.filter((usage) => usage.name !== "");
});

const usedCountOrderedPerks = computed(() => {
	return Object.keys(statsForEachPerk.value)
		.sort((a, b) => {
			const aCount = statsForEachPerk.value[a].length;
			const bCount = statsForEachPerk.value[b].length;
			return bCount - aCount;
		})
		.slice(0, 6);
});

const damagesForEachWeapon = computed(() => {
	return stats.value.reduce(
		(acc, stat) => {
			if (stat.weaponDamages) {
				for (const weapon of stat.weaponDamages) {
					const weaponName = resolveWeaponData(weapon.weaponDefClass).name;
					if (!acc[weaponName]) {
						acc[weaponName] = 0;
					}
					acc[weaponName] += weapon.damageAmount;
				}
			}
			return acc;
		},
		{} as { [weaponName: string]: number },
	);
});

const weaponUsages = computed(() => {
	const sortedWeapons = Object.entries(damagesForEachWeapon.value)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 6);
	return sortedWeapons.map(([name, count], index) => {
		return {
			name,
			count,
			color: COLOR_LIST[index % COLOR_LIST.length],
		};
	});
});

const totalWeaponCount = computed(() => {
	return Object.values(damagesForEachWeapon.value).reduce(
		(acc, count) => acc + count,
		0,
	);
});

onMounted(async () => {
	await Promise.all([getPlayerData(), getPlayerStats(), getPlayerRecords()]);
});

watch(
	() => [isVictory.value],
	async () => await getPlayerRecords(),
);

async function getPlayerData(): Promise<void> {
	try {
		isGetPlayerDataError.value = false;
		const steamID =
			convertToString(route.params.id) ?? throwInvalidParameterError("steamID");
		const fetchedPlayerData = await apiClient.getPlayerData([steamID]);
		if (fetchedPlayerData.length === 0 || fetchedPlayerData[0].id !== steamID) {
			throw new Error("Player not found");
		}

		playerData.value = fetchedPlayerData[0];
	} catch (error) {
		isGetPlayerDataError.value = true;
		console.error(error);
	}
}

async function getPlayerStats(): Promise<void> {
	try {
		isGetPlayerStatsError.value = false;
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
		isGetPlayerStatsError.value = true;
	}
}

function setupStats(): void {
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
}

async function getPlayerRecords(): Promise<void> {
	try {
		isGetPlayerRecordsError.value = false;
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
		isGetPlayerRecordsError.value = true;
	}
}

const orderedPerks = computed(() => {
	return PERK_LIST.map((perk) =>
		Object.keys(statsForEachPerk.value).find(
			(key) => key.toLowerCase() === perk.toLowerCase(),
		),
	).filter((perk) => perk !== undefined);
});

function onPageChange(newPage: number): void {
	page.value = newPage;
	getPlayerRecords();
}
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
						<v-alert v-else-if="isGetPlayerDataError" type="error" outlined>
							Failed to fetch player data. Please try again later.
						</v-alert>
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
						<v-card-text v-if="stats.length > 0">
							<table class="mb-4">
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
							<UsageBar title="Most Used Perks" :usages="perkUsages" :total="stats.length" class="mb-4" />
							<UsageBar title="Most Damage Dealt Weapons" :usages="weaponUsages" :total="totalWeaponCount" />
						</v-card-text>
						<v-alert v-else-if="isGetPlayerStatsError" type="error" outlined>
							Failed to fetch player stats. Please try again later.
						</v-alert>
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
		<v-alert v-else-if="isGetPlayerRecordsError" type="error" outlined class="mb-4">
			Failed to fetch records. Please try again later.
		</v-alert>
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
