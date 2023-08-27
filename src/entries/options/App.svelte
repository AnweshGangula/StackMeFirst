<script>
	import Header from "~/lib/Header.svelte";
	import Preferences from "~/lib/Preferences.svelte";
	import { devModeSuffix, pageTypeEnum } from "~/utils/constants";

	import optionsMixpanel from "./mixpanelOptions";
	optionsMixpanel();
	let devMode = import.meta.env.VITE_DEV_MODE == "true";

	const devAttribute = () => {
		// ref: https://stacktuts.com/how-to-have-a-conditional-attribute-in-svelte-3
		return devMode ? { dataDevMode: devModeSuffix } : {};
	};
</script>

<div id="optionsRoot" class:devMode data-devMode={devMode ? devModeSuffix : null}>
	<Header />
	<main>
		<Preferences pageType={pageTypeEnum.options} />
	</main>
</div>

<style>
	:global(body) {
		width: 450px;
		/* height: 300px; */
	}
	#optionsRoot{
		padding: 0 15px;
	}
	#optionsRoot.devMode {
		border: 5px solid firebrick;
	}
	#optionsRoot.devMode::before {
		content: attr(data-devMode); /* https://stackoverflow.com/a/59028650/6908282 */
		color: white;
		white-space: nowrap;
		position: absolute;
		padding: 3px;
		z-index: 1000;
		background: firebrick;
		left: 3px;
		/* top: -5px; */
		/* border-radius: 5px; */
	}
</style>
