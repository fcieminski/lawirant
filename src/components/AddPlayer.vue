<template>
	<div class="game__menu">
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
					<span>{{ newPlayer.name }}</span>
				</div>
				<div v-if="players">
					<div
						@click="startVote ? voteForPlayer(player) : null"
						v-for="player in players"
						:key="player.id"
						class="players__player"
						:class="[voted && voted.id === player.id ? 'players__vote' : '', 'cp']"
					>
						<i class="material-icons-two-tone">face</i>
						<span>{{ player.name }}</span>
						<i v-if="startVote" class="material-icons-two-tone vote__indicator">forward</i>
					</div>
				</div>
			</div>
		</div>
		<div v-if="clickToStart">
			<div class="button__container">
				<div @click="$eventBus.$emit('startGame')" class="btn">Rozpocznij</div>
			</div>
			<div class="button__container">
				<div @click="$eventBus.$emit('resetGame')" class="btn">Resetuj</div>
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
				players: {},
				clickToStart: false,
				startVote: false,
				voted: null
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
			this.$eventBus.$on("prepareToPlay", payload => {
				this.clickToStart = payload;
			});
			this.$eventBus.$on("startVote", payload => {
				this.startVote = payload;
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
			},
			voteForPlayer(player) {
				this.voted = { ...player, voted: true };
				this.$eventBus.$emit("votedPlayer", player);
			}
		},
		destroyed() {
			this.$eventBus.$off();
		}
	};
</script>

<style lang='scss' scoped>
	.game__menu {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		.button__container {
			margin-bottom: 20px;
			display: flex;
			justify-content: center;
		}
	}
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
			padding: 5px;
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
			&.players__vote {
				border: 3px solid yellow;
			}
		}
    }
    .vote__indicator{
        transform: rotate(180deg);
        margin-left: auto;
    }
</style>