<script>
	import Preferences from "~/lib/Preferences.svelte";
	import Header from "~/lib/Header.svelte";
</script>

<Header />
<main>
	<slot />
	<Preferences pageType="popup" />
</main>

<style>
	:global(body) {
		width: 350px;
		/* height: 300px; */
	}
</style>
