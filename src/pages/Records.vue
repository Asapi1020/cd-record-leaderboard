<script setup lang="ts">
import { CDAPIClient } from "@this/lib/apiClient";
import type { Record } from "@this/lib/type";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import RecordCards from "../components/RecordCards.vue";
import RecordTable from "../components/RecordTable.vue";

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
const errorMessage = ref<string>("");

const onPageChange = (newPage: number) => {
	router.push({ query: { ...route.query, page: newPage } });
};

const getRecords = async () => {
	isLoading.value = true;
	try {
		const fetchedRecords = await apiClient.getRecordsV2(
			page.value,
			isVictory.value,
		);
		[records.value, totalRecordsNum.value] = fetchedRecords;
	} catch (error) {
		console.error(error);
		errorMessage.value = "Failed to fetch records. Please try again later.";
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
			<v-alert v-else-if="errorMessage" type="error" outlined class="mb-4">
				{{ errorMessage }}
			</v-alert>
			<div v-else>
				<v-container v-if="!mdAndUp">
					<RecordCards :records="records" />
				</v-container>
				<div v-else>
					<RecordTable :records="records" />
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
</style>
