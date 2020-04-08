<template>
	<div class="home">
		<div class="logo--big">LAWIRANT</div>
	</div>
</template>

<script>
	export default {
		name: "Home",
		data() {
			return {};
		},
		components: {},
		created() {},
		computed: {},
		methods: {}
	};
</script>

<style lang='scss' scoped>
	.home {
		display: flex;
		justify-content: center;
		height: 100%;
		align-items: center;
		.logo--big {
			background: linear-gradient(
				90deg,
				rgba(0, 153, 4, 1) 8%,
				rgba(234, 239, 14, 1) 42%,
				rgba(234, 239, 14, 1) 68%,
				rgba(0, 212, 255, 1) 100%
			);
			background-clip: text;
			color: transparent;
			overflow: hidden;
			font-family: Voltaire;
			font-size: 10rem;
		}
	}
</style>