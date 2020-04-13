<template>
	<div class="start">
		<div class="table" v-if="createTable">
			<div>Utwórz stół</div>
			<div class="pr">
				<input
					class="law__input law__input--border"
					placeholder="nazwa nowego stołu"
					type="text"
					v-model="tableName"
					@focus="existingTable = ''"
				/>
				<transition name="fade">
					<i v-if="tableName" @click="createNewTable" class="material-icons-two-tone cp input--button"
						>check_circle</i
					>
				</transition>
			</div>
			<div>lub dołącz do istniejącego</div>
			<div class="pr">
				<input
					class="law__input law__input--border"
					placeholder="nazwa istniejącego stołu"
					type="text"
					v-model="existingTable"
					@focus="tableName = ''"
				/>
				<transition name="fade">
					<i
						@click="joinExistingTable"
						v-show="existingTable"
						class="material-icons-two-tone cp input--button"
						>check_circle</i
					>
				</transition>
			</div>
			<transition name="fade">
				<div class="error" v-if="error">
					<i style="margin-right: 8px" class="material-icons-two-tone">error</i>
					<div>{{ error }}</div>
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
	import firebase from "firebase";
	export default {
		name: "Home",
		components: {},
		data() {
			return {
				name: "",
				createTable: false,
				tableName: "",
				existingTable: "",
				error: "",
				id: null,
				currentPlayer: {}
			};
		},
		created() {
			if (this.$route.params.id) {
				firebase
					.firestore()
					.collection("players/")
					.doc(this.$route.params.id)
					.get()
					.then(doc => {
						if (doc.exists) {
                            this.currentPlayer = doc.data();
							this.createTable = true;
						} else {
							this.$router.go(-1);
						}
					})
					.catch(e => {
						console.warn(e);
						this.error = "Errooor";
						setTimeout(() => {
							this.error = "";
						}, 3000);
					});
			} else {
				this.$router.go(-1);
			}
		},
		methods: {
			createNewTable() {
				if (this.tableName) {
					const table = {
						name: this.tableName,
						id:
							"_" +
							Math.random()
								.toString(36)
								.substring(2, 9)
					};
					let arr = Array.from({ length: 39 }).map((ele, index) => index);
					firebase
						.firestore()
						.collection("gametable/")
						.doc(table.id)
						.set({
                            tableName: table.name,
							game: {
								players: [
									{
										name: this.currentPlayer.name,
										card: false,
										id: this.currentPlayer.id
									}
								],
								started: false,
								admin: this.currentPlayer.id,
								k6: 0,
								k8: 0,
								rolled: false,
								showPlayersToVote: false,
								nextRollFor: null,
								votedPlayers: [
									{
										name: this.currentPlayer.name,
										id: this.currentPlayer.id,
										count: 0
									}
								],
								points: [],
								typedPlayer: [],
								cardSet: 1,
								cards: arr,
                                usedCards: [],
                                alreadyVoted: [],
                                currentCard: 0,
                                endGame: false,
							}
						})
						.then(() => {
							this.$router.push({
								name: "table",
								params: { tableId: table.id, playerId: this.currentPlayer.id }
							});
						})
						.catch(e => {
							console.warn(e);
						});
				}
			},
			joinExistingTable() {
				if (this.existingTable) {
					const existingTable = this.existingTable.trim();
					firebase
						.firestore()
						.collection("gametable")
						.doc(existingTable)
						.update({
							"game.players": firebase.firestore.FieldValue.arrayUnion({
								name: this.currentPlayer.name,
								id: this.currentPlayer.id,
								card: false
							}),
							"game.votedPlayers": firebase.firestore.FieldValue.arrayUnion({
								name: this.currentPlayer.name,
								id: this.currentPlayer.id,
								count: 0
							}),
							"game.started": false
						})
						.then(() => {
							this.$router.push({
								name: "table",
								params: { tableId: existingTable, playerId: this.currentPlayer.id }
							});
						})
						.catch(e => {
							console.warn(e);
							this.error = "Stół nie istnieje!";
							setTimeout(() => {
								this.error = "";
							}, 3000);
						});
				}
			}
		}
	};
</script>

<style lang="scss">
	.background {
		background: linear-gradient(
			90deg,
			rgba(0, 153, 4, 1) 8%,
			rgba(234, 239, 14, 1) 42%,
			rgba(234, 239, 14, 1) 68%,
			rgba(0, 212, 255, 1) 100%
		);
	}
	.start {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		.table {
			display: flex;
			flex-direction: column;
			text-align: left;
			.input--button {
				position: absolute;
				right: 0px;
				top: 10px;
			}
		}
	}

	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.5s;
	}
	.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
		opacity: 0;
	}
</style>