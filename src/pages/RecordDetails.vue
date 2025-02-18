<script setup lang="ts">
import { CDAPIClient } from "@this/lib/apiClient";
import {
	perkData,
	resolveWeaponData,
	resolveZedData,
} from "@this/lib/kfClassNameResolver";
import type { Record, SteamAccount } from "@this/lib/type";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const apiClient = new CDAPIClient();
const route = useRoute();

const record = ref<Record | null>(null);
const playerData = ref<{ [key: string]: SteamAccount }>({});

const getRecord = async () => {
	record.value = null;
	try {
		const id = route.params.id;
		if (typeof id !== "string") {
			throw new Error("Invalid record ID");
		}

		record.value = await apiClient.getRecord(id);
	} catch (error) {
		console.error(error);
	}
};

const getPlayerData = async (steamIDs: string[]) => {
	try {
		const fetchedPlayerData = await apiClient.getPlayerData(steamIDs);
		for (const datum of fetchedPlayerData) {
			Object.assign(playerData.value, { [datum.id]: datum });
		}
	} catch (error) {
		console.error(error);
	}
};

const resolveWeaponDataDisplay = (weaponDefClass: string) => {
	const { name, image } = resolveWeaponData(weaponDefClass);
	return image
		? `<img src="${image}" alt="Weapon Icon" class="inline-image">${name}`
		: name;
};

const resolveZedDataDisplay = (zedClass: string) => {
	const { name, image } = resolveZedData(zedClass);
	return image
		? `<img src="${image}" alt="Zed Icon" class="inline-image">${name}`
		: name;
};

onMounted(async () => {
	await getRecord();
	if (record.value) {
		const steamIDs = record.value.userStats.map((stat) => stat.steamID);
		await getPlayerData(steamIDs);
	}
});
</script>
<template>
	<v-main class="custom-main">
		<v-container v-if="record">
            <v-row>
				<v-col cols="12">
					<v-card class="dark-red-background">
						<v-card-title>Match Result</v-card-title>
					</v-card>
				</v-col>
                <v-col cols="12" md="8">
                    <v-card class="h-100">
                        <v-card-text>
							<div>{{ new Date(record.matchInfo.timeStamp).toLocaleString() }}</div>
                            <div v-if="record.matchInfo.isSolo">Solo</div>
							<div v-else-if="record.matchInfo.serverName">{{ record.matchInfo.serverName}}</div>
							<div v-if="!record.matchInfo.isSolo">{{ record.matchInfo.serverIP }}</div>
						</v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="4">
                    <v-card class="h-100 d-flex align-center justify-center">
						<v-card-title>{{ record.matchInfo.isVictory ? "Victory" : `Defeat at Wave ${record.matchInfo.defeatWave}` }}</v-card-title>
					</v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card class="mb-4">
						<v-card-title>Settings</v-card-title>
                        <v-card-text>
							<table>
								<tbody>
									<tr>
										<td>Map</td><td>{{ record.matchInfo.mapName }}</td>
									</tr>
									<tr>
										<td>Spawn Cycle</td><td>{{ record.matchInfo.CDInfo.spawnCycle }}</td>
									</tr>
									<tr>
										<td>Max Monsters</td><td>{{ record.matchInfo.CDInfo.maxMonsters }}</td>
									</tr>
									<tr>
										<td>Cohort Size</td><td>{{ record.matchInfo.CDInfo.cohortSize }}</td>
									</tr>
									<tr>
										<td>Wave Size Fakes</td><td>{{ record.matchInfo.CDInfo.waveSizeFakes }}</td>
									</tr>
									<tr>
										<td>Spawn Poll</td><td>{{ record.matchInfo.CDInfo.spawnPoll }}</td>
									</tr>
									<tr>
										<td>Spawn Mod</td><td>{{ record.matchInfo.CDInfo.spawnMod }}</td>
									</tr>
								</tbody>
							</table>
						</v-card-text>
                    </v-card>
					<v-card>
						<v-card-text>
							<table>
								<tbody>
									<tr>
										<td>ZT Spawn Mode</td><td>{{ record.matchInfo.CDInfo.ZTSpawnMode }}</td>
									</tr>
									<tr>
										<td>ZT Spawn Slow Down</td><td>{{ record.matchInfo.CDInfo.ZTSpawnSlowDown }}</td>
									</tr>
									<tr>
										<td>Zeds Teleport Closer</td><td>{{ record.matchInfo.CDInfo.zedsTeleportCloser }}</td>
									</tr>
									<tr>
										<td>Disable Spawners</td><td>{{ record.matchInfo.CDInfo.disableSpawners }}</td>
									</tr>
								</tbody>
							</table>
						</v-card-text>
					</v-card>
                </v-col>
				<v-col cols="12" md="6">
					<v-card class="mb-4">
						<v-card-text>
							<table>
								<tbody>
									<tr>
										<td>Trash HP Fakes</td><td>{{ record.matchInfo.CDInfo.trashHPFakes }}</td>
									</tr>
									<tr>
										<td>QP HP Fakes</td><td>{{ record.matchInfo.CDInfo.QPHPFakes }}</td>
									</tr>
									<tr>
										<td>FP HP Fakes</td><td>{{ record.matchInfo.CDInfo.FPHPFakes }}</td>
									</tr>
									<tr>
										<td>SC HP Fakes</td><td>{{ record.matchInfo.CDInfo.SCHPFakes }}</td>
									</tr>
								</tbody>
							</table>
						</v-card-text>
					</v-card>
					<v-card class="mb-4">
						<v-card-text>
							<table>
								<tbody>
									<tr>
										<td>Albino Alphas</td><td>{{ record.matchInfo.CDInfo.albinoAlphas }}</td>
									</tr>
									<tr>
										<td>Albino Crawlers</td><td>{{ record.matchInfo.CDInfo.albinoCrawlers }}</td>
									</tr>
									<tr>
										<td>Albino Gorefasts</td><td>{{ record.matchInfo.CDInfo.albinoGorefasts }}</td>
									</tr>
									<tr>
										<td>Disable Robots</td><td>{{ record.matchInfo.CDInfo.disableRobots }}</td>
									</tr>
									<tr>
										<td>Fleshpound Rage Spawns</td><td>{{ record.matchInfo.CDInfo.fleshpoundRageSpawns }}</td>
									</tr>
								</tbody>
							</table>
						</v-card-text>
					</v-card>
					<v-card>
						<v-card-text>
							<table>
								<tbody>
									<tr>
										<td>Start with Full Ammo</td><td>{{ record.matchInfo.CDInfo.startWithFullAmmo }}</td>
									</tr>
									<tr>
										<td>Start with Full Armor</td><td>{{ record.matchInfo.CDInfo.startWithFullArmor }}</td>
									</tr>
									<tr>
										<td>Start with Full Grenade</td><td>{{ record.matchInfo.CDInfo.startWithFullGrenade }}</td>
									</tr>
								</tbody>
							</table>
						</v-card-text>
					</v-card>
				</v-col>
				<v-col cols="12">
					<v-card>
						<v-card-title>Mutators</v-card-title>
						<v-card-text>
							<span v-for="(mutator, index) in record.matchInfo.mutators" :key="index">
								{{ mutator }}
								<span v-if="index < record.matchInfo.mutators.length - 1">, </span>
							</span>
						</v-card-text>
					</v-card>
				</v-col>
				<v-col v-if="record.matchInfo.cheatMessages.length > 0" cols="12">
					<v-card>
						<v-card-title>Cheat Messages</v-card-title>
						<v-card-text>
							<span v-for="(message, index) in record.matchInfo.cheatMessages" :key="index">
								{{ message }}
								<span v-if="index < record.matchInfo.cheatMessages.length - 1">, </span>
							</span>
						</v-card-text>
					</v-card>
				</v-col>
				<v-col cols="12">
					<v-card class="dark-red-background">
						<v-card-title>Player Stats</v-card-title>
					</v-card>
				</v-col>
            </v-row>
			<v-row v-for="(stat, index) in record.userStats" :key="index">
				<v-col cols="12" md="4">
					<v-card class="h-100">
						<v-card-title>
							<img v-if="playerData[stat.steamID] && playerData[stat.steamID].avatarHash" :src="`https://avatars.cloudflare.steamstatic.com/${playerData[stat.steamID].avatarHash}_full.jpg`" alt="steam avatar" class="inline-image">
							<a :href="playerData[stat.steamID]?.url ?? `https://steamcommunity.com/profiles/${stat.steamID}`" class="steam-link">
								{{ playerData[stat.steamID]?.name ?? stat.playerName ?? stat.steamID }}
							</a>
						</v-card-title>
						<v-card-text>
							<table>
								<tbody>
									<tr>
										<td>Perk</td>
										<td>
											<img :src="perkData[stat.perkClass.toLowerCase()][1]" alt="Perk Icon" class="inline-image">
											{{ perkData[stat.perkClass.toLowerCase()][0] }}
										</td>
									</tr>
									<tr>
										<td>Damage Dealt</td><td>{{ stat.damageDealt.toLocaleString() }}</td>
									</tr>
									<tr>
										<td>Damage Taken</td><td>{{ stat.damageTaken.toLocaleString() }}</td>
									</tr>
									<tr>
										<td>Heals Given</td><td>{{ stat.healsGiven.toLocaleString() }}</td>
									</tr>
									<tr>
										<td>Heals Received</td><td>{{ stat.healsReceived.toLocaleString() }}</td>
									</tr>
									<tr>
										<td>Dosh Earned</td><td>{{ stat.doshEarned.toLocaleString() }}</td>
									</tr>
									<tr>
										<td>Hit Accuracy</td><td>{{ stat.shotsFired ? ((stat.shotsHit / stat.shotsFired) * 100).toFixed(2) : 0 }} %</td>
									</tr>
									<tr>
										<td>HS Accuracy</td><td>{{ stat.shotsHit ? ((stat.headShots / stat.shotsHit) * 100).toFixed(2) : 0 }} %</td>
									</tr>
									<tr>
										<td>Deaths</td><td>{{ stat.deaths }}</td>
									</tr>
								</tbody>
							</table>
						</v-card-text>
					</v-card>
				</v-col>
				<v-col cols="12" md="8">
					<v-card class="mb-4">
						<v-card-title>Weapon Damages</v-card-title>
						<v-card-text>
							<table>
								<thead>
									<tr>
										<th>Weapon</th>
										<th>Damage</th>
										<th>Headshots</th>
										<th>Large Kills</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="(weaponDamage, index) in stat.weaponDamages" :key="index">
										<td v-html="resolveWeaponDataDisplay(weaponDamage.weaponDefClass)"></td>										
										<td class="number">{{ weaponDamage.damageAmount.toLocaleString() }}</td>
										<td class="number">{{ weaponDamage.headShots.toLocaleString() }}</td>
										<td class="number">{{ weaponDamage.largeZedKills.toLocaleString() }}</td>
									</tr>
								</tbody>
							</table>
						</v-card-text>
					</v-card>
					<v-card>
						<v-card-title>Zed Kills</v-card-title>
						<v-card-text>
							<table>
								<thead>
									<tr>
										<th>Zed</th>
										<th>Kills</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="(zedKill, index) in stat.zedKills" :key="index">
										<td v-html="resolveZedDataDisplay(zedKill.zedClass)"></td>
										<td class="number">{{ zedKill.killCount.toLocaleString() }}</td>
									</tr>
								</tbody>
							</table>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
        </v-container>
        <v-container v-else>
            <v-progress-circular indeterminate color="primary" class="mx-auto my-4"></v-progress-circular>
        </v-container>
	</v-main>
</template>

<style scoped lang="scss">
.dark-red-background {
    background-color: #8B0000;
    color: white;
}
.steam-link {
    color: white;
    text-decoration: none;
}
table th,
table td {
	padding: 4px;
	text-align: left;
}

table td.number {
	text-align: right;
}
</style>

<style lang="scss">
</style>
