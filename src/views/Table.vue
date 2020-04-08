<template>
	<div class="table" v-if="game.players">
		<div class="table__header">
			<div class="dice__container" @click="game.rolled ? null : rollDice()">
				<div class="dice__box">
					<div class="dice dice--k6">{{ game.k6 }}</div>
					<div class="dice dice--k9">
						<p>{{ game.k9 }}</p>
					</div>
				</div>
			</div>
		</div>
		<div class="table__top">
			<div v-if="game.started">
				<div class="card" v-if="!currentPlayer.card">
					KARTA
				</div>
				<div v-else class="logo--big">LAWIRANT</div>
			</div>
		</div>
		<div class="table__spacer"></div>
		<div class="table__bottom">
			<div v-if="game.started">
				<div class="card">
					PLANSZA
				</div>
			</div>
		</div>
		<!-- <div>Stół: {{ $route.params.tableId }}</div>
		<div>Gracz: {{ currentPlayer && currentPlayer.player }}</div>
		<div>
			<p>Gracze:</p>
			<div v-for="(player, index) in game.players" :key="index">{{ player.player }}</div>
		</div>
		<div>
			<button v-if="admin && !game.started" @click="startGame">Zacznij grę</button>
			<button v-if="admin && game.started" @click="startNewGame">Nowa gra</button>
		</div>
		<div class="game__box" v-if="game.started">
			<div class="box__card">
				<img v-if="!currentPlayer.card" :src="`${publicPath}img/card${game.cardSet}.JPG`" alt="" />
				<span v-else>JESTEŚ LAWIRANTEM!</span>
			</div>
			<div class="dice__container" @click="game.rolled ? null : rollDice()">
				<div class="dice__box">
					<div class="dice dice--k6">{{ game.k6 }}</div>
					<div class="dice dice--k9">
						<p>{{ game.k9 }}</p>
					</div>
				</div>
			</div>
			<div class="card__container" v-if="game.rolled">
				<div class="card">
					<img :src="`${publicPath}img/${1 + game.currentCard}.JPG`" alt="" />
				</div>
				<button v-if="admin" @click="endRound">Zakończ rundę</button>
			</div>
			<div class="users__container" v-if="game.showPlayersToVote">
				<div>Zagłosuj na gracza!</div>
				<div
					@click="voteForPlayer(player)"
					v-for="(player, index) in showOtherPlayers"
					:key="index"
					class="player__icon"
				>
					{{ player.player }}
				</div>
				<div v-if="voted">
					Zagłosowano!
				</div>
			</div>
			<div v-if="admin && voted">
				<button @click="endGame">Zakończ grę</button>
			</div>
			<div class="endgame__container" v-if="game.typedPlayer.length !== 0">
				<div>{{ isTypedRight }}</div>
				<button @click="startNextRound">Nowa runda!</button>
			</div>
		</div> -->
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
				oldVoted: [],
				publicPath: process.env.BASE_URL
			};
		},
		components: {},
		created() {
			if (this.$route.params.tableId) {
				firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId)
					.onSnapshot(doc => {
                        this.game = doc.data().game;
                        
						const playersWithoutCurrent = this.game.players.filter(
							player => player.id !== this.$route.params.playerId
						);
                        const isAdmin = this.game.players.some(player => this.$route.params.playerId === player.id);
                        
						this.$eventBus.$emit("players", playersWithoutCurrent);
						this.$eventBus.$emit("prepareToPlay", isAdmin);
					});
			}
			this.$eventBus.$on("startGame", () => {
				this.startGame();
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
				fire.get()
					.then(doc => {
						let players = doc.data().game.players;
						let votedPlayers = doc.data().game.votedPlayers;
						let index = votedPlayers.findIndex(currentPlayer => currentPlayer.id === player.id);
						if (!this.voted) {
							votedPlayers[index].count++;
							fire.update({
								"game.votedPlayers": votedPlayers
							});
						}
						this.voted = true;
					})
					.catch(e => {
						console.warn(e);
					});
			},
			rollDice() {
				const { cards, usedCards, currentCard } = this.game;
				let cardToPlay = Math.floor(Math.random() * cards.length);
				usedCards.forEach(card => {
					if (cardToPlay === card) {
						cardToPlay = Math.floor(Math.random() * cards.length);
					}
				});
				usedCards.push(cardToPlay);
				firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId)
					.update({
						"game.k6": Math.floor(1 + Math.random() * 6),
						"game.k9": Math.floor(1 + Math.random() * 8),
						"game.rolled": true,
						"game.currentCard": cardToPlay,
						"game.usedCards": usedCards
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
				this.voted = false;
				this.oldPlayers = JSON.parse(JSON.stringify(this.game.players));
				this.oldVoted = JSON.parse(JSON.stringify(this.game.votedPlayers));
				const lawirant = Math.floor(Math.random() * this.game.players.length);
				let fire = await firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);
				try {
					this.game.players[lawirant].card = true;
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
					"game.typedPlayer": []
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
					"game.typedPlayer": []
				});
				this.startGame();
			}
		}
		// beforeDestroy() {
		// 	if (this.admin) {
		// 		firebase
		// 			.firestore()
		// 			.collection("gametable")
		// 			.doc(this.$route.params.tableId)
		// 			.delete();
		// 	}
		// }
	};
</script>

<style lang='scss' scoped>
	::selection {
		color: none;
		background: none;
	}

	.table {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		.table__header {
			flex: 1;
			background: $mainBlue;
			.dice__container {
				margin-left: 20px;
				margin-bottom: 20px;
				.dice__box {
					display: flex;
					justify-content: space-between;
					align-items: center;
					width: 250px;
					border-radius: 4px;
					margin-top: 20px;
					cursor: pointer;
					.dice {
						width: 70px;
						height: 70px;
						margin: 20px;
						border: 2px solid $mainGreen;
						border-radius: 10px;
						display: flex;
						justify-content: center;
						align-items: center;
						&.dice--k6 {
							font-size: 2rem;
							color: white;
							background: $mainGreen;
						}
						&.dice--k9 {
							color: white;
							font-size: 2rem;
							position: relative;
							width: 0;
							height: 0;
							border-left: 40px solid transparent;
							border-right: 40px solid transparent;
							border-bottom: 70px solid $mainGreen;
							p {
								position: absolute;
								top: -10px;
							}
						}
					}
				}
			}
		}
		.table__top {
			flex: 3;
			display: flex;
			justify-content: center;
			align-items: center;
			.card {
				width: 500px;
				border: 2px solid black;
				height: 300px;
			}
		}
		.table__spacer {
			height: 5px;
			background: $background;
		}
		.table__bottom {
			flex: 3;
			display: flex;
			justify-content: center;
			align-items: center;
			.card {
				width: 500px;
				border: 2px solid black;
				height: 300px;
			}
		}
	}

	.game__box {
		margin-top: 50px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.card__container {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			.card {
				border: 2px solid #004cff;
				padding: 20px;
				margin-bottom: 20px;
				img {
					width: 500px;
				}
			}
		}
		.endgame__container {
			margin-top: 20px;
			border: 5px solid #f00;
			margin-bottom: 10px;
			padding: 20px;
		}
	}

	.users__container {
		flex-direction: row;
		margin-top: 20px;
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
</style>