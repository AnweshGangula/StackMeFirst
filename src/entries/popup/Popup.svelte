<script>
	import browser from "webextension-polyfill";
	// browser.storage.sync.clear(); // use this while development to clear any existing options
	// let console = browser.extension.getBackgroundPage().console;
	import Notification from "./Components/Notification.svelte";
	import { restore_options, CheckWarnings } from "./popupUtils";
	import { ignoreUrlList } from "~/utils/constants";
	import StackContent from "./Components/StackContent.svelte";
	import Header from "~/lib/Header.svelte";
	import Preferences from "~/lib/Preferences.svelte";

	let warningText;
	let warningType = new Set();
	let glCurrTab;
	let answerList, commentList;

	// Once the DOM is ready...
	const dispDOM = displayHTML().then(() => restore_options("popup"));

	async function displayHTML() {
		await browser.tabs.query({ active: true, lastFocusedWindow: true }).then(async function (tabs) {
			// get current Tab - https://stackoverflow.com/a/29151677/6908282
			let activeTab = tabs[0];
			glCurrTab = tabs[0];
			let activeURL = new URL(activeTab.url);
			let currURL = activeURL.href; // .at(-1)
			let website = activeURL.host;
			let URLpathname = activeURL.pathname;
			const isStackOverflow = website == "stackoverflow.com";

			const ignoreURL = ignoreUrlList.some((url) => URLpathname.includes(url));
			const isQuestion = URLpathname.startsWith("/questions/") && !ignoreURL;
			if (isStackOverflow) {
				await browser.tabs.sendMessage(tabs[0].id, { from: "popup", subject: "popupDOM" }).then(
					// ...also specifying a callback to be called
					//    from the receiving end (content script).
					function (info) {
						const warn = CheckWarnings(tabs[0], info);
						warningText = warn.warningText;
						warningType = warn.warningType;

						if (warningType.has("warn")) {
							return;
						}
						answerList = info.answerList;
						commentList = info.commentList;
					}
				);
				// if (website != "stackoverflow.com" || website != "extensions") {
				// // commenting this because the options page is not working as expected in edge://extensions/ page
				//     console.log(website);
				//     document.getElementById("config").style.display = "none";
				// }
			} else {
				warningText = "! Please open a Stack Overflow question to use this addin.";
				warningType.add("warn");
			}
		});
	}
</script>

<Header />
<main>
	{#await dispDOM}
		<p>loading</p>
	{:then result}
		<Notification {warningType} {warningText} {glCurrTab} />
		<div id="myStack">
			<StackContent eleList={answerList} type="answer" tab={glCurrTab} />
			<StackContent eleList={commentList} type="comment" tab={glCurrTab} />
			<hr />
		</div>
		<Preferences pageType="popup" />
	{/await}
</main>

<style>
	:global(body) {
		width: 350px;
		/* height: 300px; */
	}
	hr {
		/* reference: https://stackoverflow.com/a/5619906/6908282 */
		margin-top: 5px;
		height: 2px;
		border: none;
		background: lightgray;
	}
</style>
