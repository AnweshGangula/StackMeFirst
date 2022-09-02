<script>
	export let warningType = "";
</script>

{#if warningType != ""}
	<div id="notification" class={warningType}>
		<slot />
	</div>
{/if}

<style>
	#notification {
		margin: 15px 5px;
		padding: 0 5px;
		background-color: mistyrose;
		color: firebrick;
		border: 1px solid firebrick;
	}

	#notification.warn {
		background-color: mistyrose;
		color: firebrick;
		border-color: firebrick;
	}

	#notification.notify_author {
		background-color: palegreen;
		color: darkgreen;
		border-color: darkgreen;
	}
</style>
