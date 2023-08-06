<script>
	import browser from "webextension-polyfill";
	import ExecuteScroll from "../popupUtils.js";
	import { LinkToComment, LinkToAnswer, LinkToLinkQ } from "~/utils/utils.js";
	import { pageTypeEnum, suffix } from "~/utils/constants";

	export let pageType;
	export let eleList = [];
	export let type;
	export let tab; // this is updated by the props of StackContent component
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
			if(pageType == pageTypeEnum.sidebar){
				window.open(data.url)
			}else{
				browser.tabs.create({ url: data.url });
			}
		} else {
			ExecuteScroll(tab.id, eleId, type, OffsetHeight, pageType);
		}
	}

	function updateVars(eleId) {
		const eleData = eleId
		if (type == "comment") {
			eleData.eleId = eleData.commentId // + eleData.suffix;
		}
		if (type == "linkq") {
			eleData.eleId = eleData.linQId // + eleData.suffix;
		}
		if (type == "answer") {
			eleData.eleId = eleData.answerId // + eleData.suffix;
		}

		let suffixDOM = "";
		let eleClass = new Set();
		if (eleData.suffix.includes(suffix.hidden)) {
			eleClass.add(classList.redirect);
			suffixDOM += suffix.hidden;
		}

		if (eleData.suffix.includes(suffix.favorite)) {
			eleClass.add(classList.favorite);
			suffixDOM += suffix.favorite;
		}

		if (eleData.suffix.includes(suffix.author)) {
			eleClass.add(classList.author);
			suffixDOM += suffix.author;
		}

		let linkRef = "";
		if (type == "comment") {
			linkRef = LinkToComment(tab.url, eleData);
		} else if (type == "answer") {
			linkRef = LinkToAnswer(tab.url, eleData);
		} else if (type == "linkq") {
			eleClass.add(classList.redirect);
			linkRef = LinkToLinkQ(tab.url, eleData.linQId);
		}

		return { eleId: eleData.eleId, eleClass, linkRef, suffixDOM };
	}
</script>

<details id="{type}List" open>
	<summary>
		<b class={`itemCount ${count>0 ? "" : "zeroCount"}`}>
			<span id="{type}Count">{count}</span>
			{type}{count > 1 ? "s" : ""}
		</b>
		- {itemVerb} by you:
	</summary>
	{#if count > 0}
		<ul>
			{#each eleList as eleId}
				{@const meta = updateVars(eleId)}
				<li
					class={"backLinks " + Array.from(meta.eleClass).join(" ")}
					title={eleId.title ?? ""}
					on:click|preventDefault={() => onClickEvent({
							dest: meta.eleClass,
							eleId: meta.eleId,
							url: meta.linkRef
						})
						}>
					<span id="backLinkText" data-title={eleId.title ?? ""}>
						<a href={meta.linkRef} >
							{meta.eleId}
						</a>
						{meta.suffixDOM}
					</span>
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

	ul{
		/* list-style-position: inside; */
	}

	li {
		position: relative;
		margin: 3px 0;
		/* display: flex; */
		align-items: center;
		cursor: pointer;
	}
	.itemCount {
		background-color: gold;
		/* background-color: var(--yellow-400, gold); */
		padding: 2px 5px;
	}

	.zeroCount{
		background-color: gray;
		color: lightgray;
	}
	.featureOff {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}

	li.author {
		background-color: rgb(152 251 152 / 55%);
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
		padding: 0 3px;
		border-radius: 3px;
		/* color: white; */
		font-style: italic;
	}

	li.redirect{
		position: relative;
	}
	li.redirect::before {
		/* Reference: https://stackoverflow.com/a/52058198/6908282 */
		content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQElEQVR42qXKwQkAIAxDUUdxtO6/RBQkQZvSi8I/pL4BoGw/XPkh4XigPmsUgh0626AjRsgxHTkUThsG2T/sIlzdTsp52kSS1wAAAABJRU5ErkJggg==);
		position: absolute;
		left: -2.5em;
		
	}

	.backLinks{
		position: relative;
		white-space: nowrap;
		/* overflow: hidden; */
	}

	#backLinkText {
		display: inline-flex;
		align-items: flex-end;
		width: 100%;
		text-overflow: ellipsis;
	}
	.backLinks:hover #backLinkText:after {
		width: auto;
		opacity: 1;
	}
	#backLinkText:after {
		content: attr(data-title);
		font-size: smaller;
		margin-left: 10px;
		/* width: 100%; */
		overflow: hidden;
		text-overflow: inherit;
		width: 100px;
		opacity: 0.3;
	}
</style>
