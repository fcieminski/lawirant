<template>
	<div class="start">
		<div class="start__sidebar-left">
			<input type="text" v-model="name" />
		</div>
		<div class="start__sidebar-right">
			<button @click="startGame">Ok</button>
			<div v-if="createTable">
				<input placeholder="nazwa nowego stołu" type="text" v-model="tableName" />
				<button v-show="tableName" @click="createNewTable">Utwórz stół</button>
				<input placeholder="nazwa istniejącego stołu" type="text" v-model="existingTable" />
				<button @click="joinExistingTable" v-show="existingTable">Dołącz do stołu</button>
			</div>
			<div v-if="error">
				{{ error }}
			</div>
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
				id: null
			};
		},
		methods: {
			startGame() {
				if (this.name) {
					this.id =
						"_" +
						Math.random()
							.toString(36)
							.substring(2, 9);
					firebase
						.firestore()
						.collection("players/")
						.add({
							name: this.name,
							id: this.id
						});
					this.createTable = true;
				} else {
					this.createTable = false;
				}
			},
			createNewTable() {
				if (this.tableName) {
					let arr = Array.from({ length: 39 }).map((ele, index) => index);
					console.log(arr, this.tableName);
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
						.catch(() => {
							this.error = "Stół nie istnieje!";
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
		height: 100%;
		.start__sidebar-left {
			background: $background;
			border: 2px solid white;
			flex: 0 0 30%;
        }
        .start__sidebar-right{
	flex: 0 0 70%;
        }
	}
</style>