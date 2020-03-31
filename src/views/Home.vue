<template>
	<div class="home">
		<input type="text" v-model="name" />
		<button @click="startGame">Ok</button>

		<div v-if="createTable">
			<input placeholder="nazwa nowego stołu" type="text" v-model="tableName" />
			<button v-show="tableName" @click="createNewTable">Utwórz stół</button>
			<input placeholder="nazwa istniejącego stołu" type="text" v-model="exitingTable" />
			<button @click="joinExistingTable" v-show="exitingTable">Dołącz do stołu</button>
		</div>
		<div v-if="error">
			{{ error }}
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
				exitingTable: "",
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
					firebase
						.firestore()
						.collection("gametable")
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
                                        count: 0,
									}
								],
                                points: [],
                                typedPlayer: []
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
				if (this.exitingTable) {
					firebase
						.firestore()
						.collection("gametable")
						.doc(this.exitingTable.toUpperCase())
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
								params: { tableId: this.exitingTable.toUpperCase(), playerId: this.id }
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
