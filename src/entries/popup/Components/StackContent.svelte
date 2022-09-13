<script>
	import browser from "webextension-polyfill";
	import ExecuteScroll from "../popupUtils.js";

	export let eleList = [];
	export let type;
	export let tab = { id: 0, url: "https://stackoverflow.com/" };
	let OffsetHeight = 60;
	const count = eleList ? eleList.length : 0;

	function onClickEvent(data) {
		const dest = data.dest;
		const eleId = data.eleId;

		if (dest == "hidden") {
			browser.tabs.create({ url: data.url });
		} else {
			ExecuteScroll(tab.id, eleId, type, OffsetHeight);
		}
	}

	function updateVars(eleId) {
		let suffix = " (hidden)";
		let eleClass = "";
		if (eleId.includes(suffix)) {
			eleClass = "hidden";
			eleId = eleId.replace(suffix, "");
		} else {
			suffix = "";
		}

		let activeURL = new URL(tab.url);
		const baseURL = activeURL.protocol + "//" + activeURL.host + activeURL.pathname; // ref: https://stackoverflow.com/a/6257480/6908282
		let linkRef = "";
		if (type == "Comment") {
			const quesId = activeURL.pathname.replace("/questions/", "").split("/")[0];
			linkRef = activeURL.href + "#" + eleId.replace("-", "") + "_" + quesId;
		}
		if (type == "Answer") {
			const ref = eleId.replace("answer-", "");
			linkRef = baseURL + "/" + ref + "#" + ref;
		}

		return { eleId, eleClass, linkRef, suffix };
	}
</script>

<details id="{type}List" open>
	<summary>
		<b><span id="{type}Count">{count}</span> {type}/s</b> posted by you:
	</summary>
	{#if count > 0}
		<ul>
			{#each eleList as eleId}
				{@const meta = updateVars(eleId)}
				<li>
					<a
						href={meta.linkRef}
						class={meta.eleClass}
						on:click|preventDefault={() => onClickEvent({ dest: meta.eleClass, eleId: meta.eleId, url: meta.linkRef })}
					>
						{meta.eleId}
					</a>
					{meta.suffix}
				</li>
			{/each}
		</ul>
	{/if}
	<p id="{type}Off" class="featureOff" />
</details>

<style>
	.featureOff {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}

	a.hidden {
		background-color: darkgrey;
		/* margin: 2px; */
		padding: 0 3px;
		border-radius: 3px;
		/* color: white; */
		font-style: italic;
	}

	a.hidden::before {
		/* Reference: https://stackoverflow.com/a/52058198/6908282 */
		content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQElEQVR42qXKwQkAIAxDUUdxtO6/RBQkQZvSi8I/pL4BoGw/XPkh4XigPmsUgh0626AjRsgxHTkUThsG2T/sIlzdTsp52kSS1wAAAABJRU5ErkJggg==);
		margin: 0 3px 0 5px;
	}
</style>
