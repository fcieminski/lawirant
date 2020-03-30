<template>
	<div>
		<div>Stół: {{ $route.params.tableId }}</div>
		<div>Gracz: {{ currentPlayer && currentPlayer.player }}</div>
		<div>
			<p>Gracze:</p>
			<div v-for="(player, index) in players" :key="index">{{ player.player }}</div>
		</div>
		<div>
			<button v-if="$route.params.admin && !gameStarted" @click="startGame">Zacznij grę</button>
			<button v-if="$route.params.admin && gameStarted" @click="startNewGame">Nowa gra</button>
		</div>
		<div v-if="gameStarted">
			{{ currentPlayer.card ? "JESTEŚ LAWIRANTEM!" : "NORMALNA KARTA" }}
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
				oldPlayers: {},
				gameStarted: false,
				currentPlayer: null
			};
		},
		components: {},
		created() {
			firebase
				.firestore()
				.collection("gametable")
				.doc(this.$route.params.tableId)
				.onSnapshot(doc => {
					this.players = Object.values(doc.data().players);
					this.currentPlayer = Object.values(doc.data().players).find(
						player => player.id === this.$route.params.playerId
					);
					this.gameStarted = doc.data().started;
				});
		},
		computed: {},
		methods: {
			async startGame() {
				this.oldPlayers = JSON.parse(JSON.stringify(this.players));
				const lawirant = Math.floor(Math.random() * Object.keys(this.players).length);
				let fire = await firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);
				this.players[lawirant].card = true;
				fire.update({
					players: { ...this.players },
					started: true
				});
				this.gameStarted = true;
			},
			async startNewGame() {
				let fire = await firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);
				this.players = JSON.parse(JSON.stringify(this.oldPlayers));
				fire.update({
					started: false
				});
				this.startGame();
			}
		}
	};
</script>

<style lang='scss' scoped>
</style>