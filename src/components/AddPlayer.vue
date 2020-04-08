<template>
	<div>
		<div class="logo">LAWIRANT</div>
		<div class="input__container">
			<input
				@keyup.enter="addNewPlayer"
				placeholder="Twój nick"
				class="law__input"
				id="name"
				type="text"
				v-model="name"
				:disabled="newPlayer"
			/>
			<i @click="addNewPlayer" class="material-icons-two-tone cp">check_circle</i>
		</div>
		<div class="players" v-if="newPlayer">
			<div>Gracze:</div>
			<div class="players__player">
				<i class="material-icons-two-tone">face</i>
				<span>{{ this.newPlayer.name }}</span>
			</div>
			<div v-if="players">
				<div v-for="player in players" :key="player.id" class="players__player">
					<i class="material-icons-two-tone">face</i>
					<span>{{ player.player }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import firebase from "firebase";
	export default {
		name: "AddPlayer",
		data() {
			return {
				name: "",
				newPlayer: null,
				players: {}
			};
		},
		components: {},

		watch: {
			"$route.params": function() {
				const id = this.$route.params.id || this.$route.params.playerId;
				this.getPlayerData(id);
			}
		},

		created() {
			if (this.$route.params.id) {
				this.getPlayerData(this.$route.params.id);
			}
			this.$eventBus.$on("players", payload => {
				this.players = payload;
			});
		},
		computed: {},
		methods: {
			getPlayerData(id) {
				firebase
					.firestore()
					.collection("players/")
					.doc(id)
					.get()
					.then(doc => {
						if (doc.exists) {
							this.newPlayer = doc.data();
						} else {
							this.$router.push("/");
						}
					})
					.catch(e => {
						console.warn(e);
					});
			},
			addNewPlayer() {
				if (this.name) {
					this.id =
						"_" +
						Math.random()
							.toString(36)
							.substring(2, 9);
					const player = {
						name: this.name,
						id: this.id
					};
					firebase
						.firestore()
						.collection("players/")
						.doc(player.id)
						.set(player)
						.then(() => {
							this.newPlayer = player;
							this.name = "";
							this.$router.push({
								name: "prepare-game",
								params: { name: this.newPlayer.name, id: this.newPlayer.id }
							});
						})
						.catch(e => {
							console.warn(e);
						});
				}
			}
		},
		destroyed() {
			this.$eventBus.$off();
		}
	};
</script>

<style lang='scss' scoped>
	.input__container {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.logo {
		font-family: Voltaire;
		font-size: 5rem;
		color: white;
	}
	.players {
		color: white;
		font-size: 1.5rem;
		.players__player {
			margin: 20px 20px 10px 20px;
			display: flex;
			justify-content: left;
			align-items: center;
			span {
				max-width: 260px;
				text-overflow: ellipsis;
				overflow: hidden;
			}
			i {
				margin-right: 20px;
			}
		}
	}
</style>