<script>
	import browser from "webextension-polyfill";
	import ExecuteScroll from "../popupUtils";

	export let warningType = new Set(),
		warningText,
		glCurrTab;
</script>

{#if warningType.size != 0}
	<div id="notification">
		{#if warningType.has("notify_author")}
			<p class="notify_author">
				You are the author of
				<a
					href={glCurrTab.url}
					target="_blank"
					rel="noopener noreferrer"
					on:click|preventDefault={() => ExecuteScroll(glCurrTab.id, null, "question", 0)}
				>
					this question
				</a>
			</p>
		{/if}
		{#if warningText != ""}
			<p class="warn">
				{#if warningText.startsWith("! Please open a Stack Overflow")}
					! Please open a 
					<a href='https://stackoverflow.com/' on:click|preventDefault={() => browser.tabs.create({ url: 'https://stackoverflow.com/'})} >Stack Overflow</a>
					 question to use this addin.
				{:else}
					 {warningText}
				{/if}
			</p>
		{/if}
	</div>
{/if}

<style>
	#notification > * {
		margin: 10px 0px;
		padding: 5px;
		background-color: mistyrose;
		color: firebrick;
		border: 1px solid firebrick;
	}

	#notification .warn {
		background-color: mistyrose;
		color: firebrick;
		border-color: firebrick;
	}

	#notification .notify_author {
		background-color: palegreen;
		color: darkgreen;
		border-color: darkgreen;
	}
</style>
