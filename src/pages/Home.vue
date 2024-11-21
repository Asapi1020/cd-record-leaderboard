<script setup lang="ts"></script>

<template>
	<v-main class="d-flex flex-column align-center justify-center" style="min-height: 300px; background-color: #1e1e1e;">
		<v-icon icon="mdi-trophy" size="48" class="mb-4" />
		<h1 class="title">CD Record Leader Board</h1>
		<p class="subtitle">powered by Combined Edition</p>
		<v-btn color="primary" class="mt-4" to="/records">View Leaderboard</v-btn>
	</v-main>
</template>

<style scoped lang="scss">
.title {
	font-size: 2.5rem;
	color: #ffffff;
	text-align: center;
}

.subtitle {
	font-size: 1.25rem;
	color: #cccccc;
	text-align: center;
}

.v-main {
	padding: 20px;
}
</style>
