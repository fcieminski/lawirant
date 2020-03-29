<template>
	<div>
		<div>Stół: {{ $route.params.id }}</div>
		<div>Gracz: {{ $route.params.player }}</div>
		<div>
			<p>Players:</p>
			<div v-for="(player, index) in players" :key="index">{{ player.player }}</div>
		</div>
		<div v-if="$route.params.admin">
			<button @click="startGame">Zacznij grę</button>
			<button @click="startNewGame">Nowa gra</button>
		</div>
	</div>
</template>

<script>
	import firebase from "firebase";
	export default {
		name: "Table",
		data() {
			return {
				players: {},
				oldPlayers: {}
			};
		},
		components: {},
		created() {
			firebase
				.firestore()
				.collection("gametable")
				.doc(this.$route.params.id)
				.onSnapshot(doc => {
					this.players = doc.data().players;
				});
		},
		computed: {},
		methods: {
			async startGame() {
				this.oldPlayers = JSON.parse(JSON.stringify(this.players));
				const kameleon = Math.floor(Math.random() * Object.keys(this.players).length);
				let fire = await firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.id);
				this.players[kameleon].card = true;
				fire.update({
					players: { ...this.players }
				});
			},
			startNewGame() {
				this.players = JSON.parse(JSON.stringify(this.oldPlayers));
				this.startGame();
			}
		}
	};
</script>

<style lang='scss' scoped>
</style>