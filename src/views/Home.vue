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
				error: ""
			};
		},
		methods: {
			startGame() {
				if (this.name) {
					firebase
						.firestore()
						.collection("players/")
						.add({
							name: this.name
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
							players: [
								{
									player: this.name,
									card: false
								}
							]
						})
						.then(() => {
							this.$router.push({
								name: "table",
								params: { id: this.tableName.toUpperCase(), player: this.name, admin: true }
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
							players: firebase.firestore.FieldValue.arrayUnion({ player: this.name, card: false })
						})
						.then(() => {
							this.$router.push({
								name: "table",
								params: { id: this.exitingTable.toUpperCase(), player: this.name }
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
