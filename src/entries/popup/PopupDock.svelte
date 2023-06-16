<script>
	import browser from "webextension-polyfill";
	// browser.storage.sync.clear(); // use this while development to clear any existing options
	// let console = browser.extension.getBackgroundPage().console;
	import Notification from "./Components/Notification.svelte";
	import { restore_options, CheckWarnings } from "./popupUtils";
	import { IsStackOverflow } from "~/utils/utils";
	import { pageTypeEnum } from "~/utils/constants";
	import StackContent from "./Components/StackContent.svelte";
	// import Preferences from "~/lib/Preferences.svelte";
	import Loader from "./Components/Loader.svelte";
	import LinkedQues from "./Components/LinkedQues.svelte";

	export let stackData;

	let warningText;
	let warningType = new Set();
	let glCurrTab = { id: 0, url: window.location.href };
	let answerList, commentList, linkData;

	// Once the DOM is ready...
	displayHTML()
    // restore_options(pageTypeEnum.popup); // dont need this since dock doesn't have preferences

	function displayHTML() {
        extractMyStack(stackData.popupContent);
        // .then((output) => {
        // 	console.log("Done");
        // 	console.log({ output });
        // });
	}

	function extractMyStack(info, tabs = []) {
		const currTab = tabs[0] ?? pageTypeEnum.sidebar;
		const warn = CheckWarnings(currTab, info);
		warningText = warn.warningText;
		warningType = warn.warningType;

		// if (warningType.has("warn")) {
		// 	return;
		// }
		answerList = info.answerList;
		commentList = info.commentList;
		linkData = info.linkData;

		return "extraction done";

		// return new Promise(function (resolve) {
		// 	setTimeout(resolve);
		// });
	}
</script>

<main>
    <Notification pageType={pageTypeEnum.sidebar} {warningType} {warningText} {glCurrTab} />
    <div id="myStack">
        <StackContent pageType={pageTypeEnum.sidebar} eleList={answerList} type="answer" tab={glCurrTab} />
        <StackContent pageType={pageTypeEnum.sidebar} eleList={commentList} type="comment" tab={glCurrTab} />
        <LinkedQues pageType={pageTypeEnum.sidebar} linkQData={linkData} glCurrTab={glCurrTab}/>
    </div>
    <!-- <Preferences pageType={pageType.popup} /> -->
</main>

<style>
	:global(body) {
		font-family: "Inter", Helvetica Neue, Arial, Helvetica, sans-serif;
		width: 350px;
		/* height: 0px; this doesn't show scrollbar is height is close to scroll */
		margin: 0 25px; /* Scrollbar is overlapping with content */
	}
	hr {
		/* reference: https://stackoverflow.com/a/5619906/6908282 */
		margin-top: 5px;
		height: 2px;
		border: none;
		background: lightgray;
	}
</style>
