<template>
	<div v-if="game.players">
		<div>Stół: {{ $route.params.tableId }}</div>
		<div>Gracz: {{ currentPlayer && currentPlayer.player }}</div>
		<div>
			<p>Gracze:</p>
			<div v-for="(player, index) in game.players" :key="index">{{ player.player }}</div>
		</div>
		<div>
			<button v-if="admin && !game.started" @click="startGame">Zacznij grę</button>
			<button v-if="admin && game.started" @click="startNewGame">Nowa gra</button>
		</div>
		<div v-if="game.started">
			<div>
				{{ currentPlayer.card ? "JESTEŚ LAWIRANTEM!" : "NORMALNA KARTA" }}
			</div>
			<div class="dice__container" @click="game.rolled ? null : rollDice()">
				<div class="dice__box">
					<div class="dice dice--k6">{{ game.k6 }}</div>
					<div class="dice dice--k9">
						<p>{{ game.k9 }}</p>
					</div>
				</div>
			</div>
			<div v-if="game.rolled">
				KARTA DO GRYYYYYYYYYYYYYYYY
				<button @click="endRound">Zakończ rundę</button>
			</div>
			<div class="users__container" v-if="game.showPlayersToVote">
				<div
					@click="voteForPlayer(player)"
					v-for="(player, index) in showOtherPlayers"
					:key="index"
					class="player__icon"
				>
					{{ player.player }}
				</div>
			</div>
			<div v-if="admin && voted">
				<button @click="endGame">Zakończ grę</button>
			</div>
			<div v-if="game.typedPlayer.length !== 0">
				{{ isTypedRight }}
			</div>
		</div>
	</div>
</template>

<script>
	import firebase from "firebase";
	export default {
		name: "Table",
		data() {
			return {
				oldPlayers: {},
				game: {},
				voted: false,
				oldVoted: []
			};
		},
		components: {},
		created() {
			firebase
				.firestore()
				.collection("gametable")
				.doc(this.$route.params.tableId)
				.onSnapshot(doc => {
					this.game = doc.data().game;
				});
		},
		computed: {
			showOtherPlayers() {
				return Object.values(this.game.players).filter(player => player.id !== this.$route.params.playerId);
			},
			currentPlayer() {
				return Object.values(this.game.players).find(player => player.id === this.$route.params.playerId);
			},
			admin() {
				return this.game.admin === this.$route.params.playerId;
			},
			isTypedRight() {
				let typed = this.game.typedPlayer && this.game.typedPlayer[0];
				if (typed) {
					let player = Object.values(this.game.players).find(player => player.id === typed.id);
					return player.card ? `Dobrze! lawirantem jest: ${player.player}` : `Buuu... lawirant jest bezpieczny!`;
				}
			}
		},
		methods: {
			async endGame() {
				let fire = await firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);
				let data = await fire.get().then(doc => {
					return doc.data().game;
				});
				let maxVotes = data.votedPlayers.reduce((max, player) => (max.count > player.count ? max : player));
				fire.update({
					"game.typedPlayer": [maxVotes]
				});
			},
			voteForPlayer(player) {
				let fire = firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);
				fire.get().then(doc => {
					let players = doc.data().game.players;
					let votedPlayers = doc.data().game.votedPlayers;
					let index = votedPlayers.findIndex(currentPlayer => currentPlayer.id === player.id);

					if (!this.voted) {
						votedPlayers[index].count++;
						fire.update({
							"game.votedPlayers": votedPlayers
						});
						if (players[index].card) {
							
						} else { 
							
						}
					}
					this.voted = true;
				});
			},
			rollDice() {
				firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId)
					.update({
						"game.k6": Math.floor(1 + Math.random() * 6),
						"game.k9": Math.floor(1 + Math.random() * 9),
						"game.rolled": true
					});
			},
			endRound() {
				firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId)
					.update({
						"game.showPlayersToVote": true
					});
			},
			async startGame() {
				this.oldPlayers = JSON.parse(JSON.stringify(this.game.players));
				this.oldVoted = JSON.parse(JSON.stringify(this.game.votedPlayers));
				const lawirant = Math.floor(Math.random() * Object.keys(this.game.players).length);
				let fire = await firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);
				try {
					this.game.players[lawirant].card = true;
					console.log(this.game.players[lawirant], this.game.players);
					fire.update({
						"game.players": this.game.players,
						"game.started": true
					});
				} catch (e) {
					console.error(e);
				}
			},
			async startNewGame() {
				let fire = await firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);
				this.game.players = JSON.parse(JSON.stringify(this.oldPlayers));
				fire.update({
					"game.started": false,
					"game.k6": 0,
					"game.k9": 0,
					"game.rolled": false,
					"game.showPlayersToVote": false,
					"game.votedPlayers": this.oldVoted,
					"game.points": [],
					"game.typedPlayer": {}
				});
				this.startGame();
			},
			async startNextRound() {
				let fire = await firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);
				this.game.players = JSON.parse(JSON.stringify(this.oldPlayers));
				fire.update({
					"game.started": false,
					"game.k6": 0,
					"game.k9": 0,
					"game.rolled": false,
					"game.showPlayersToVote": false,
					"game.votedPlayers": this.oldVoted,
					"game.typedPlayer": {}
				});
				this.startGame();
			}
		},
		beforeDestroy() {
			if (this.admin) {
				firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId)
					.delete();
			}
		}
	};
</script>

<style lang='scss' scoped>
	::selection {
		color: none;
		background: none;
	}
	.users__container {
		display: flex;
		justify-content: center;
		align-items: center;
		.player__icon {
			width: 50px;
			height: 50px;
			border: 2px solid black;
			border-radius: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 10px;
		}
	}

	.dice__container {
		display: flex;
		justify-content: center;
		align-items: center;
		.dice__box {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 200px;
			border: 1px solid black;
			border-radius: 4px;
			margin-top: 20px;
			cursor: pointer;
			.dice {
				width: 50px;
				height: 50px;
				margin: 20px;
				border: 2px solid black;
				border-radius: 10px;
				display: flex;
				justify-content: center;
				align-items: center;
				&.dice--k6 {
					font-size: 2rem;
				}
				&.dice--k9 {
					color: white;
					font-size: 2rem;
					position: relative;
					width: 0;
					height: 0;
					border-left: 30px solid transparent;
					border-right: 30px solid transparent;
					border-bottom: 50px solid black;
					p {
						position: absolute;
						top: -20px;
					}
				}
			}
		}
	}
</style>