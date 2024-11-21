<script>
import Header from './components/Header.vue';
import * as labs from 'vuetify/labs/components';

export default {
name: 'App',
components: {
	...labs,
    Header
  }
}
</script>

<template>
	<v-layout class="rounded rounded-md">
		<Header />
		<router-view></router-view>
	</v-layout>
</template>

<style scoped lang="scss">
.v-main {
	margin-top: 60px;
}
</style>
