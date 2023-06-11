<script>
	import Header from "~/lib/Header.svelte";
	import Preferences from "~/lib/Preferences.svelte";
	import { pageTypeEnum } from "~/utils/constants";
</script>

<Header />
<main>
	<Preferences pageType={pageTypeEnum.options} />
</main>

<style>
	:global(body) {
		width: 350px;
		/* height: 300px; */
	}
</style>
