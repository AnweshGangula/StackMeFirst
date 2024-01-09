<script>
	import { SvelteToast, toast } from '@zerodevx/svelte-toast'

	import DockContent from "./Components/DockContent.svelte";

	export let stackData;

	import logo from "~/assets/logo.svg";
	const logoImageUrl = new URL(logo, import.meta.url).href;

	// Default options
	const toastOptions = {
		duration: 4000,       // duration of progress bar tween to the `next` value
		initial: 1,           // initial progress bar value
		next: 0,              // next progress value
		pausable: true,      // pause progress bar tween on mouse hover
		dismissable: true,    // allow dismiss with close button
		reversed: false,      // insert new toast to bottom of stack
		intro: { x: 256 },    // toast intro fly animation settings
		// theme: {
		// 	'--toastBtnContent': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' ...")`
		// },
		classes: ["SMFToast"]           // user-defined classes
	}

	const remainingAPIQuota = stackData.popupContent.apiQuota.currQuota_remaining;
	const apiCallsPerPage = 4; // number of API calls "Stack Me First" uses per page
	const remainingUses = Math.floor(remainingAPIQuota/apiCallsPerPage) ?? 0;
	if(remainingUses <= 10){
		toast.push(`
		<img src=${logoImageUrl} height="20" alt="Stack Me First Logo" /> 
		<details>
			<summary>Remaining API Quota: ${remainingUses}</summary>
			<p>You can use the Stack Me First Plugin for ${remainingUses} more times</p>
		</details>

		`,{
		// // Effectively disables autoclose when `initial`==`next`
		pausable: true,
		classes: ["SMFToast"],
		// initial: 0
		});
	}

</script>
<div id="Sidebar_Root">
	<SvelteToast options = {toastOptions} />
	<!-- toast is used in LinkedQues.svelte `toast.push("Please login again to get LinkQ's"` -->
	<DockContent {stackData}/>
</div>

<style>
		#Sidebar_Root {
		--toastWidth: 24rem;
		--toastBackground: blanchedalmond;
		--toastColor: #424242;
		--toastBarBackground: brown;
		--toastContainerTop: auto;
		--toastContainerRight: 1rem;
		--toastContainerBottom: 2rem;
		/* --toastContainerLeft: calc(50vw - 8rem); */
  }

</style>
