<script setup lang="ts">
import { CDAPIClient } from "@this/lib/apiClient";
import type { Record, SteamAccount } from "@this/lib/type";
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
			isVictory.value,
			steamID,
			true,
		);
		[records.value, totalRecordsNum.value] = fetchedRecords;
	} catch (error) {
		console.error(error);
	}
};

onMounted(async () => {
	await getPlayerData();
	if (playerData.value) {
		await getPlayerRecords(playerData.value.id);
	}
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
				<v-col cols="12">
					<v-card>
						stats
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
			<RecordTable :records="records" />
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
</style>
