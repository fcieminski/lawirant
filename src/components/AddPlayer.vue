<template>
	<div>
		<div class="logo">LAWIRANT</div>
		<div class="input__container">
			<input placeholder="Twój nick" class="container__input" id="name" type="text" v-model="name" />
			<i class="material-icons-two-tone cp">check_circle</i>
		</div>
	</div>
</template>

<script>
	export default {
		name: "AddPlater",
		data() {
			return {
				name: ""
			};
		},
		components: {},
		created() {},
		computed: {},
		methods: {}
	};
</script>

<style lang='scss' scoped>
	.input__container {
        display: flex;
        justify-content: center;
        align-items: center;
		.container__input {
			width: 250px;
			height: 50px;
			padding: 20px;
			font-size: 1rem;
			margin: 20px;
			border: none;
		}
	}
	.logo {
		font-family: Voltaire;
		font-size: 5rem;
		color: white;
	}
	.material-icons-two-tone {
		font-size: 3rem;
	}
</style>