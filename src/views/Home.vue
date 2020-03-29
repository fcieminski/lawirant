<template>
	<div class="home">
		<input type="text" v-model="name" />
		<button @click="startGame">Ok</button>

		<div v-if="createTable">
			<input placeholder="nazwa nowego stołu" type="text" v-model="tableName" />
			<button v-show="tableName" @click="createNewTable">Utwórz stół</button>
			<button>Dołącz do stołu</button>
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
				tableName: ""
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
						.doc("firstTable")
						.update({
							players: firebase.firestore.FieldValue.arrayUnion(this.name)
						});
				}
			}
		}
	};
</script>
