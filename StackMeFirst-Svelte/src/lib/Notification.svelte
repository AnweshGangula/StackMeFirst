<script>
	export let warningText = "";
	export let warningType = "warn";

	console.log({ warningType, warningText });
</script>

{#if warningText != ""}
	<div>
		<p id="notification" class={warningType}>{warningText}</p>
	</div>
{/if}

<style>
	#notification {
		margin: 20px 5px;
		padding: 5px;
		background-color: mistyrose;
		color: firebrick;
		border: 1px solid firebrick;
	}

	#notification.warn {
		background-color: mistyrose;
		color: firebrick;
		border-color: firebrick;
	}

	#notification.notify {
		background-color: palegreen;
		color: darkgreen;
		border-color: darkgreen;
	}
</style>
