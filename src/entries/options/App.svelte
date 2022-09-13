<script>
	import Header from "~/lib/Header.svelte";
	import Preferences from "~/lib/Preferences.svelte";
</script>

<Header />
<main>
	<Preferences />
</main>

<style>
	:global(body) {
		width: 350px;
		/* height: 300px; */
	}
</style>
