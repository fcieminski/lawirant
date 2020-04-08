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
		<div v-else class="logo--big">LAWIRANT</div>
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
				id: null
			};
		},
		created() {
			this.$eventBus.$on("startGame", () => {
				this.createTable = true;
			});
		},
		methods: {
			createNewTable() {
				if (this.tableName) {
					let arr = Array.from({ length: 39 }).map((ele, index) => index);
					firebase
						.firestore()
						.collection("gametable/")
						.doc(this.tableName.toUpperCase())
						.set({
							game: {
								players: [
									{
										player: this.name,
										card: false,
										id: this.id
									}
								],
								started: false,
								admin: this.id,
								k6: 0,
								k9: 0,
								rolled: false,
								showPlayersToVote: false,
								nextRollFor: this.id,
								votedPlayers: [
									{
										player: this.name,
										id: this.id,
										count: 0
									}
								],
								points: [],
								typedPlayer: [],
								cardSet: 1,
								cards: arr,
								usedCards: [],
								currentCard: 0
							}
						})
						.then(() => {
							this.$router.push({
								name: "table",
								params: { tableId: this.tableName.toUpperCase(), playerId: this.id }
							});
						});
				}
			},
			joinExistingTable() {
				if (this.existingTable) {
					firebase
						.firestore()
						.collection("gametable")
						.doc(this.existingTable.toUpperCase())
						.update({
							"game.players": firebase.firestore.FieldValue.arrayUnion({
								player: this.name,
								id: this.id,
								card: false
							}),
							"game.votedPlayers": firebase.firestore.FieldValue.arrayUnion({
								player: this.name,
								id: this.id,
								count: 0
							}),
							"game.started": false
						})
						.then(() => {
							this.$router.push({
								name: "table",
								params: { tableId: this.existingTable.toUpperCase(), playerId: this.id }
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
        },
        destroyed(){
            this.$$eventBus.$off();
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