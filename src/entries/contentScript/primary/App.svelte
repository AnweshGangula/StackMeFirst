<script>
	import { SvelteToast } from '@zerodevx/svelte-toast'

	import DockContent from "./Components/DockContent.svelte";

	export let stackData;

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
		classes: []           // user-defined classes
	}

</script>
<div id="Sidebar_Root">
	<SvelteToast options = {toastOptions} />
	<!-- toast is used in LinkedQues.svelte `toast.push("Please login again to get LinkQ's"` -->
	<DockContent {stackData}/>
</div>

<style>
		#Sidebar_Root {
		--toastContainerTop: auto;
		--toastContainerRight: 1rem;
		--toastContainerBottom: 2rem;
		/* --toastContainerLeft: calc(50vw - 8rem); */
  }

</style>
