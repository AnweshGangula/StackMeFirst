<script>
	import browser from "webextension-polyfill";
	// browser.storage.sync.clear(); // use this while development to clear any existing options
	// let console = browser.extension.getBackgroundPage().console;
	import Popup from "./Components/Popup.svelte";
	import Notification from "./Components/Notification.svelte";
	import { restore_options } from "./popupUtils";
	import { ignoreUrlList } from "~/utils/constants";
	import StackContent from "./Components/StackContent.svelte";

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
						SetPopupContent(tabs[0], info);
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

	// Update the relevant fields with the new data.
	function SetPopupContent(currTab, info) {
		//  reference: https://stackoverflow.com/a/20023723/6908282
		const metaData = info.metaData;
		if (metaData.currUser == undefined) {
			warningText = "! Login to Stack Overflow to highlight your answers";
			warningType.add("warn");
			return;
		}

		let activeURL = new URL(currTab.url);
		let URLpathname = activeURL.pathname;
		const ignoreURL = ignoreUrlList.some((url) => URLpathname.includes(url));
		const isQuestion = URLpathname.startsWith("/questions/") && !ignoreURL;

		if (!isQuestion) {
			warningText = "! Please open a Stack Overflow question to use this addin.";
			warningType.add("warn");
			return;
		}

		if (metaData.currUser == metaData.quesAuthor) {
			warningText = "";
			warningType.add("notify_author");
		}

		if ((info.commentList == undefined || info.commentList.length == 0) && (info.answerList == undefined || info.answerList.length == 0)) {
			warningText = "! This question doesn't have any answers/comments submitted by you.";
			warningType.add("warn");
			return;
		}

		answerList = info.answerList;
		commentList = info.commentList;
	}
</script>

<Popup>
	{#await dispDOM}
		<p>loading</p>
	{:then result}
		<Notification {warningType} {warningText} {glCurrTab} />
		<div id="myStack">
			<StackContent eleList={answerList} type="Answer" tab={glCurrTab} />
			<StackContent eleList={commentList} type="Comment" tab={glCurrTab} />
			<hr />
		</div>
	{/await}
</Popup>

<style>
	hr {
		/* reference: https://stackoverflow.com/a/5619906/6908282 */
		margin-top: 5px;
		height: 2px;
		border: none;
		background: lightgray;
	}
</style>
