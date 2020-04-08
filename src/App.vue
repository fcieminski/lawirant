<template>
	<div id="app">
		<div class="main">
			<div class="main__container">
				<div class="sidebar-left">
					<add-player />
				</div>
				<div class="sidebar-right">
					<router-view />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import AddPlayer from "@/components/AddPlayer.vue";
	export default {
		components: {
			AddPlayer
		}
	};
</script>

<style lang="scss">
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
	}

	.main {
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background: $background;
		.main__container {
			background: white;
			width: calc(100vw - 25px);
			height: calc(100vh - 25px);
			display: flex;
			.sidebar-right {
				flex: 3 0;
			}
			.sidebar-left {
				padding-right: 10px;
				background: $backgroundSecond;
				flex: 0 2 400px;
			}
		}
	}
</style>
