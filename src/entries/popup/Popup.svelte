<script>
	import Preferences from "~/lib/Preferences.svelte";
	import Header from "~/lib/Header.svelte";

	export let pageType = "popup";
	export let isStackOverflow = true;
</script>

<Header />
<main>
	<slot />
	{#if pageType == "popup" && isStackOverflow}
		<div id="myStack">
			<details id="ansList" open>
				<summary>
					<b><span id="ansCount">0</span> Answer/s</b> posted by you:
				</summary>

				<p id="ansOff" class="featureOff" />
			</details>

			<details id="commList" open>
				<summary>
					<b><span id="commCount">0</span> Comment/s</b> posted by you:
				</summary>
				<p id="commOff" class="featureOff" />
			</details>
			<hr />
		</div>
	{/if}

	<Preferences />
</main>

<style>
	:global(body) {
		width: 350px;
		/* height: 300px; */
	}

	hr {
		/* reference: https://stackoverflow.com/a/5619906/6908282 */
		margin-top: 5px;
		height: 2px;
		border: none;
		background: lightgray;
	}
	.featureOff {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}
</style>
