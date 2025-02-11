<script setup lang="ts"></script>

<template>
	<v-app-bar>
		<template v-slot:prepend>
			<router-link to="/records" class="app-bar-title">
				CD Record Leader Board
			</router-link>
		</template>
	</v-app-bar>
</template>

<style scoped lang="scss">
.v-app-bar {
	padding: 4px;
	border-bottom: 2px solid #555;
}

.app-bar-title {
	font-size: 1.5rem;
	color: #ffffff;
	text-decoration: none;
	margin-left: 12px;
}
</style>
