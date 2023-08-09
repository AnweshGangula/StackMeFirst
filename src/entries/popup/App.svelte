<script>
	import { devModeSuffix } from "~/utils/constants";
	import Popup from "./Popup.svelte";

	let devMode = import.meta.env.VITE_DEV_MODE == "true";

	const devAttribute = () => {
		// ref: https://stacktuts.com/how-to-have-a-conditional-attribute-in-svelte-3
		return devMode ? { dataDevMode: devModeSuffix } : {};
	};
</script>

<div id="popupRoot" class:devMode data-devMode={devMode ? devModeSuffix : null}>
	<Popup />
</div>


<style>
	#popupRoot{
		padding: 0 15px;
	}
	#popupRoot.devMode {
		border: 5px solid firebrick;
	}
	#popupRoot.devMode::before {
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
