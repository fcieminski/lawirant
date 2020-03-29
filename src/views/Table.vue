<template>
	<div>
		<div>Stół: {{ this.$route.params.id }}</div>
		<div>
			<p>Players:</p>
			<div v-for="(player, index) in players" :key="index">{{ player }}</div>
		</div>
        <button @click="startGame">Zacznij grę</button>
	</div>
</template>

<script>
	import firebase from "firebase";
	export default {
		name: "Table",
		data() {
			return {
                players: {},
                cards: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 'kameleon']
			};
		},
		components: {},
		created() {
			firebase
				.firestore()
				.collection("gametable")
				.doc(this.$route.params.id)
				.onSnapshot(doc => {
                    this.players = doc.data().players
				});
		},
		computed: {},
		methods: {
            startGame(){

            }
        }
	};
</script>

<style lang='scss' scoped>
</style>