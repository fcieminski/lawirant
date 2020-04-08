<template>
	<div id="app">
		<div class="main">
			<div class="main__container">
				<router-view />
			</div>
		</div>
	</div>
</template>

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
		}
	}
</style>
