<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	title: string;
	usages: {
		name: string;
		count: number;
		color: string;
	}[];
	total: number;
}>();

const otherPercentage = computed(() => {
	const otherCount = props.usages.reduce((acc, usage) => acc + usage.count, 0);
	if (props.total < 0) {
		console.error("Total is less than 0, returning 0% for otherPercentage.");
		return 0;
	}
	return Math.max(0, 100 - (otherCount * 100) / props.total);
});
</script>

<template>
	<div class="usage">
		<span class="title mb-4">{{ title }}</span>
		<div class="bar-container">
			<div
				v-for="usage in usages"
				:key="usage.name"
				class="bar-segment"
				:style="{ width: `${usage.count*100/total}%`, backgroundColor: usage.color }"
			></div>
			<div
				v-if="otherPercentage > 0"
				class="bar-segment other"
				:style="{ width: `${otherPercentage}%` }"
			></div>
		</div>
		<div class="legend">
			<div v-for="usage in usages" :key="usage.name" class="legend-item">
				<span class="legend-color" :style="{ backgroundColor: usage.color }"></span>
				<span>{{ usage.name }} ({{ (usage.count*100/total).toFixed(2) }}%)</span>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.usage {
  max-width: 500px;
  font-family: Arial, sans-serif;
}

.title {
  font-size: 18px;
  color: #187700
}

.bar-container {
  display: flex;
  height: 10px;
  background: #222;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}

.bar-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.bar-segment.other {
  background: #999;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  color: #999
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 8px;
  margin-right: 5px;
  display: inline-block;
}
</style>
