<template>
	<div class="table" v-if="game.players">
		<div class="table__header">
			<div class="dice__container" @click="game.rolled ? null : rollDice()">
				<div class="dice__box">
					<div class="dice dice--k6">{{ game.k6 }}</div>
					<div class="dice dice--k8">
						<p>{{ game.k8 }}</p>
					</div>
					<div
						:class="{ 'show--arrow': game.nextRollFor === currentPlayer.id }"
						class="dice__turn animate__turn"
					>
						<i class="material-icons-two-tone">forward</i>
					</div>
				</div>
			</div>
			<div
				class="btn btn--green"
				@click="game.rolled ? endRound() : null"
				:style="game.rolled ? 'visibility: visible;' : 'visibility: hidden;'"
			>
				Zakończ rundę
			</div>
			<div class="table__info">Stół {{ tableName }} o id {{ $route.params.tableId }}</div>
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
	</div>
</template>

<script>
	import firebase from "firebase";

	export default {
		name: "Table",
		data() {
			return {
				oldPlayers: [],
				game: {},
				oldGameObject: null,
				voted: false,
				oldVoted: [],
				publicPath: process.env.BASE_URL,
				tableName: ""
			};
		},
		components: {},
		created() {
			if (this.$route.params.tableId) {
				firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId)
					.onSnapshot(
						doc => {
							this.game = doc.data().game;
							this.tableName = doc.data().tableName;

							const playersWithoutCurrent = this.game.players.filter(
								player => player.id !== this.$route.params.playerId
							);

							const isAdmin = this.game.players.some(player => this.$route.params.playerId === player.id);

							const endVote = this.game.players.every(player =>
								doc.data().game.alreadyVoted.includes(player.id)
							);

							console.log(endVote);

							this.$eventBus.$emit("players", playersWithoutCurrent);
							this.$eventBus.$emit("prepareToPlay", isAdmin);
							this.$eventBus.$emit("startVote", doc.data().game.showPlayersToVote);
						},
						e => {
							console.warn(e);
						}
					);
			}

			this.oldGameObject = JSON.parse(localStorage.getItem("oldGameObject"));

			this.$eventBus.$on("startGame", () => {
				this.startGame();
			});
			this.$eventBus.$on("resetGame", () => {
				this.resetGame();
			});
			this.$eventBus.$on("votedPlayer", payload => {
				this.voteForPlayer(payload);
			});
		},
		computed: {
			showOtherPlayers() {
				return this.game.players && this.game.players.filter(player => player.id !== this.$route.params.playerId);
			},
			currentPlayer() {
				return this.game.players && this.game.players.find(player => player.id === this.$route.params.playerId);
			},
			admin() {
				return this.game.players && this.game.admin === this.$route.params.playerId;
			},
			isTypedRight() {
				let typed = this.game.typedPlayer && this.game.typedPlayer[0];
				if (typed) {
					let player = this.game.players.find(player => player.id === typed.id);
					return player.card ? `Dobrze! lawirantem jest: ${player.player}` : `Buuu... lawirant jest bezpieczny!`;
				}
			}
		},
		methods: {
			deepCopy(toClone) {
				if ("length" in toClone) {
					return Array.from(toClone, element => Object.assign({}, element));
				} else {
					return JSON.parse(JSON.stringify(toClone));
				}
			},
			voteForPlayer(player) {
				let fire = firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);
				fire.get()
					.then(doc => {
						const { votedPlayers } = doc.data().game;
						let index = votedPlayers.findIndex(currentPlayer => currentPlayer.id === player.id);
						if (!this.voted) {
							votedPlayers[index].count++;
							fire.update({
								"game.votedPlayers": votedPlayers,
								"game.alreadyVoted": firebase.firestore.FieldValue.arrayUnion(this.currentPlayer.id)
							});
						}
						this.voted = true;
					})
					.catch(e => {
						console.warn(e);
					});
			},
			nextRoll(currentId) {
				const currentIndex = this.game.players.findIndex(player => player.id === currentId);
				const isLast = this.game.players.length - 1 === currentIndex;
				const nextPersonId = isLast ? this.game.players[0].id : this.game.players[currentIndex + 1].id;

				return nextPersonId;
			},
			removeUsedCards() {
				const { cards, usedCards, currentCard } = this.game;
				if (usedCards.length !== cards.length) {
					let cardToPlay = Math.floor(Math.random() * cards.length);

					usedCards.forEach(card => {
						if (cardToPlay === card) {
							cardToPlay = Math.floor(Math.random() * cards.length);
						}
					});

					usedCards.push(cardToPlay);

					return {
						usedCards,
						cardToPlay
					};
				} else {
					return false;
				}
			},
			rollDice() {
				const nextRoll = this.nextRoll(this.game.nextRollFor);
				const cards = this.removeUsedCards();

				firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId)
					.update({
						"game.k6": Math.floor(1 + Math.random() * 6),
						"game.k8": Math.floor(1 + Math.random() * 8),
						"game.rolled": true,
						"game.currentCard": cards.cardToPlay,
						"game.usedCards": cards.usedCards,
						"game.nextRollFor": nextRoll
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
			async endVote() {
				let fire = await firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);

				let voted = await fire.get().then(doc => {
					return doc.data().game.votedPlayers;
				});

				let maxVotes = voted.reduce((max, player) => (max.count > player.count ? max : player));

				fire.update({
					"game.typedPlayer": [maxVotes]
				});
			},
			async startGame() {
				try {
					this.oldGameObject = await this.deepCopy(this.game);
					localStorage.setItem("oldGameObject", JSON.stringify(this.oldGameObject));

					this.voted = false;

					if (this.game.players) {
						const lawirant = Math.floor(Math.random() * this.game.players.length);
						const personToRoll = this.game.players[Math.floor(Math.random() * (this.game.players.length - 1))];
						this.game.players[lawirant].card = true;

						const fire = await firebase
							.firestore()
							.collection("gametable")
							.doc(this.$route.params.tableId);

						fire.update({
							"game.players": this.game.players,
							"game.started": true,
							"game.nextRollFor": personToRoll.id
						});
					}
				} catch (e) {
					console.error(e);
				}
			},
			async startNextRound() {
				const fire = await firebase
					.firestore()
					.collection("gametable")
					.doc(this.$route.params.tableId);
				try {
					fire.update({
						game: {
							...this.oldGameObject
						}
					});
				} catch (e) {
					console.error(e);
				}
				this.startGame();
			},
			async resetGame() {
				if (this.game.started) {
					let fire = await firebase
						.firestore()
						.collection("gametable")
						.doc(this.$route.params.tableId);
					try {
						fire.update({
							game: this.oldGameObject
						});
					} catch (e) {
						console.warn(e);
					}
				}
			}
		}
	};
</script>

<style lang='scss' scoped>
	// ::selection {
	// 	color: none;
	// 	background: none;
	// }

	.table {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		.table__header {
			flex: 1;
			background: $mainBlue;
			display: flex;
			align-items: center;
			justify-content: space-between;
			.table__info {
				font-size: 2rem;
				color: $mainGreen;
			}
			.dice__container {
				margin-left: 20px;
				margin-bottom: 20px;
				.dice__box {
					display: flex;
					justify-content: space-between;
					align-items: center;
					width: 350px;
					border-radius: 4px;
					margin-top: 20px;
					.dice__turn {
						transform: rotate(180deg);
						visibility: hidden;
						&.animate__turn {
							animation: yourturn ease-in 0.7s infinite;
						}
						&.show--arrow {
							visibility: visible;
						}
					}
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
						&.dice--k8 {
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

	@keyframes yourturn {
		0% {
			transform: rotate(180deg) translate(0, 0);
		}
		50% {
			transform: rotate(180deg) translate(50px, 0);
		}
		100% {
			transform: rotate(180deg) translate(0, 0);
		}
	}
</style>