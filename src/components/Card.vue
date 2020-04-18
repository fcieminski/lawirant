<template>
	<div class="card">
		<span class="card__title">{{ card[currentCard].title }}</span>
		<div class="background--inside">
			<table class="card__table">
				<thead>
					<th></th>
					<th>A</th>
					<th>B</th>
					<th>C</th>
					<th>D</th>
				</thead>
				<tbody>
					<tr>
						<td class="row-number">1</td>
						<td class="row" v-for="card in card[currentCard].content.slice(0, 4)" :key="card">
							{{ card }}
						</td>
					</tr>
					<tr>
						<td class="row-number">2</td>
						<td class="row" v-for="card in card[currentCard].content.slice(4, 8)" :key="card">
							{{ card }}
						</td>
					</tr>
					<tr>
						<td class="row-number">3</td>
						<td class="row" v-for="card in card[currentCard].content.slice(8, 12)" :key="card">
							{{ card }}
						</td>
					</tr>
					<tr>
						<td class="row-number">4</td>
						<td class="row" v-for="card in card[currentCard].content.slice(12, 16)" :key="card">
							{{ card }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
	import { cardData } from "./cardData.js";
	export default {
		name: "Card",
		data() {
			return {
				card: cardData
			};
		},
		props: {
			currentCard: {
				type: Number,
				default: 0
			}
		},
		components: {},
		created() {},
		computed: {},
		methods: {}
	};
</script>

<style lang='scss' scoped>
	.card {
		.card__title {
			font-size: 2rem;
		}
		.background--inside {
			background: $background;
			width: 700px;
			height: 280px;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
		}
		.card__table {
			width: 97%;
			height: 90%;
			background-color: white;
			border-collapse: collapse;
			// border: 3px solid black;
			thead {
				th {
					border: 2px solid $mainBlue;
					font-size: 1.5rem;
				}
			}
			.row {
				border: 2px solid $mainBlue;
				width: 250px;
				height: 56px;
			}
			.row-number {
				width: 50px;
				border: 2px solid $mainBlue;
				font-size: 1.5rem;
			}
		}
	}
</style>