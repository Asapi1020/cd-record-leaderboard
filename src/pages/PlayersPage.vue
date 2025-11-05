<script setup lang="ts">
import { toNumber } from '@asp1020/type-utils';
import { CDAPIClient } from '@this/lib/apiClient';
import { SteamAccount } from '@this/lib/type';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const apiClient = new CDAPIClient();

const route = useRoute();
const router = useRouter();

const players = ref<(SteamAccount & { count: number })[]>([]);
const totalPlayers = ref(0);
const isLoading = ref(false);

const page = ref(toNumber(route.query.page) || 1);
const pageLength = computed(() => Math.ceil(totalPlayers.value / 30));

async function fetchPlayers(): Promise<void> {
	isLoading.value = true;
	const [data, total] = await apiClient.getUsers((page.value - 1) * 30, 30).finally(() => {
		isLoading.value = false;
	});
	players.value = data;
	totalPlayers.value = total;
}

async function onPageChange(newPage: number): Promise<void> {
	page.value = newPage;
	router.push({ query: { ...route.query, page: newPage } });
	await fetchPlayers();
}

onMounted(async () => {
	await fetchPlayers();
})
</script>

<template>
	<v-main class="custom-main">
		<v-skeleton-loader v-if="isLoading" type="table-row@30" class="mx-16" />
		<v-table v-else class="mx-16 hoverable-rows">
			<thead>
				<tr>
					<th>Players</th>
					<th>Match Count</th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="player in players" :key="player.id" @click="router.push(`/players/${player.id}`)">
					<td class="d-flex align-center">
						<div>
							<v-img :src="`https://avatars.cloudflare.steamstatic.com/${player.avatarHash}_full.jpg`" width="52" height="52" class="mr-3" />
						</div>
						<div>{{ player.name }}</div>
					</td>
					<td>{{ player.count }}</td>
				</tr>
			</tbody>
		</v-table>

		<v-pagination v-if="!isLoading" v-model="page" :length="pageLength" class="text-center mt-4" :total-visible="9" @update:model-value="onPageChange"></v-pagination>
	</v-main>
</template>

<style scoped>
.hoverable-rows:deep(tbody tr:hover){
	cursor: pointer;
	background-color: rgba(255,255,255,0.08) !important;
	transition: background-color 0.2s !important;
}
</style>
