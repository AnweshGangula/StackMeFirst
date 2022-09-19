<script>
	import browser from "webextension-polyfill";
	import ExecuteScroll from "../popupUtils.js";
	import { LinkToComment, LinkToAnswer, LinkToLinkQ } from "~/utils/utils.js";
	import { suffix } from "~/utils/constants";

	export let eleList = [];
	export let type;
	export let tab = { id: 0, url: "https://stackoverflow.com/" };
	let OffsetHeight = 60;
	const count = eleList ? eleList.length : 0;
	const itemVerb = type == "linkq" ? "upvoted/favorited/posted" : "posted";
	const classList = {
		redirect: "redirect",
		favorite: "favorite",
		author: "author",
	};

	function onClickEvent(data) {
		const dest = data.dest;
		const eleId = data.eleId;

		if (dest.has(classList.redirect)) {
			browser.tabs.create({ url: data.url });
		} else {
			ExecuteScroll(tab.id, eleId, type, OffsetHeight);
		}
	}

	function updateVars(eleId) {
		let suffixDOM = "";
		let eleClass = new Set();
		if (eleId.includes(suffix.hidden)) {
			eleClass.add(classList.redirect);
			eleId = eleId.replace(suffix.hidden, "");
			suffixDOM += suffix.hidden;
		}

		if (eleId.includes(suffix.favorite)) {
			eleClass.add(classList.favorite);
			eleId = eleId.replace(suffix.favorite, "");
			suffixDOM += suffix.favorite;
		}

		if (eleId.includes(suffix.author)) {
			eleClass.add(classList.author);
			eleId = eleId.replace(suffix.author, "");
			suffixDOM += suffix.author;
		}

		let linkRef = "";
		if (type == "comment") {
			linkRef = LinkToComment(tab.url, eleId);
		} else if (type == "answer") {
			linkRef = LinkToAnswer(tab.url, eleId);
		} else if (type == "linkq") {
			eleClass.add(classList.redirect);
			linkRef = LinkToLinkQ(eleId);
		}

		return { eleId, eleClass, linkRef, suffixDOM };
	}
</script>

<details id="{type}List" open>
	<summary>
		<b class="itemCount"><span id="{type}Count">{count}</span> {type}/s</b>
		- {itemVerb} by you:
	</summary>
	{#if count > 0}
		<ul>
			{#each eleList as eleId}
				{@const meta = updateVars(eleId)}
				<li class={Array.from(meta.eleClass).join(" ")}>
					<a href={meta.linkRef} on:click|preventDefault={() => onClickEvent({ dest: meta.eleClass, eleId: meta.eleId, url: meta.linkRef })}>
						{meta.eleId}
					</a>
					{meta.suffixDOM}
				</li>
			{/each}
		</ul>
	{/if}
	<p id="{type}Off" class="featureOff" />
</details>

<style>
	details {
		margin: 5px 0;
	}

	li {
		margin: 3px 0;
	}
	.itemCount {
		background-color: gold;
		padding: 0 2px;
	}
	.featureOff {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}

	li.author {
		background-color: palegreen;
		color: darkgreen;
		border: 0.5px solid darkgreen;
		border-radius: 5px;
		padding: 3px;
	}

	li.favorite {
		background-color: lightgoldenrodyellow;
		border: 0.5px solid orange;
		border-radius: 5px;
		padding: 0 2px 3px;
	}
	li.favorite:after {
		content: "\2605";
		color: orange;
		font-size: large;
	}
	li.redirect a {
		background-color: lightgray;
		/* margin: 2px; */
		padding: 1px;
		border-radius: 3px;
		/* color: white; */
		font-style: italic;
	}

	li.redirect a::before {
		/* Reference: https://stackoverflow.com/a/52058198/6908282 */
		content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQElEQVR42qXKwQkAIAxDUUdxtO6/RBQkQZvSi8I/pL4BoGw/XPkh4XigPmsUgh0626AjRsgxHTkUThsG2T/sIlzdTsp52kSS1wAAAABJRU5ErkJggg==);
		margin: 0 2px;
	}
</style>
