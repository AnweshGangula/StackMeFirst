<script>
	import browser from "webextension-polyfill";
	// browser.storage.sync.clear(); // use this while development to clear any existing options
	// let console = browser.extension.getBackgroundPage().console;
	import Popup from "./Popup.svelte";
	import Notification from "./Notification.svelte";

	const manifestVer = Number(import.meta.env.VITE_MANIFEST_VERSION);
	import scrollToTarget from "../entries/executeScript/executeScript";
	import { ignoreUrlList } from "~/utils/constants";

	export let pageType = "popup";
	let warningText;
	let warningType = new Set();
	let isStackOverflow;
	let glCurrTab;

	// Once the DOM is ready...
	window.addEventListener("DOMContentLoaded", () => {
		displayHTML();
		document.getElementById("btnSave").addEventListener("click", save_options);
		document.getElementById("btnReset").addEventListener("click", reset_options);
	});

	let defaultOptions = {
		hlAns: true,
		srtAns: true,
		hlCmnts: false,
	};

	function displayHTML() {
		restore_options();

		browser.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
			// get current Tab - https://stackoverflow.com/a/29151677/6908282
			let activeTab = tabs[0];
			glCurrTab = tabs[0];
			let activeURL = new URL(activeTab.url);
			let currURL = activeURL.href; // .at(-1)
			let website = activeURL.host;
			let URLpathname = activeURL.pathname;
			isStackOverflow = website == "stackoverflow.com";

			const ignoreURL = ignoreUrlList.some((url) => URLpathname.includes(url));
			const isQuestion = URLpathname.startsWith("/questions/") && !ignoreURL;
			if (isStackOverflow && isQuestion) {
				browser.tabs.sendMessage(tabs[0].id, { from: "popup", subject: "popupDOM" }).then(
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

		if (metaData.currUser == metaData.quesAuthor) {
			warningText = "";
			warningType.add("notify_author");
		}

		if (info.commentList.length == 0 && info.answerList.length == 0) {
			warningText = "! This question doesn't have any answers/comments submitted by you.";
			warningType.add("warn");
			return;
		}

		let answerList = info.answerList;
		let commentList = info.commentList;
		let answerDOM = document.getElementById("ansList");
		let ansCount = document.getElementById("ansCount");
		let commDOM = document.getElementById("commList");
		let commCount = document.getElementById("commCount");

		if (answerList !== "N/A") {
			ansCount.textContent = answerList.length;
			answerDOM.appendChild(MyStackLinks(answerList, "answer", currTab));
		}

		if (commentList !== "N/A") {
			commCount.textContent = commentList.length;
			commDOM.appendChild(MyStackLinks(commentList, "comment", currTab));
		}
	}

	function MyStackLinks(eleList, type, tab) {
		let myContent = document.createElement("ul");
		let offsetHeight = document.getElementsByTagName("header")[0].offsetHeight;

		eleList.forEach((eleID) => {
			let suffix = " (hidden)";
			let eleClass = "";
			if (eleID.includes(suffix)) {
				eleClass = "hidden";
				eleID = eleID.replace(suffix, "");
			} else {
				suffix = "";
			}
			let ansEle = document.createElement("li");
			let link = document.createElement("a");
			link.className = eleClass;
			link.textContent = eleID;

			let activeURL = new URL(tab.url);
			let linkRef = "";
			if (type == "comment") {
				const quesId = activeURL.pathname.replace("/questions/", "").split("/")[0];
				linkRef = activeURL.href + "#" + eleID.replace("-", "") + "_" + quesId;
			}
			if (type == "answer") {
				const ref = eleID.replace("answer-", "");
				linkRef = activeURL.href + "/" + ref + "#" + ref;
			}
			link.setAttribute("href", linkRef);
			link.addEventListener("click", function () {
				window.event.preventDefault();
				if (eleClass == "hidden") {
					browser.tabs.create({ url: linkRef });
				} else {
					ExecuteScroll(tab.id, eleID, type, offsetHeight);
				}
			});

			ansEle.appendChild(link);
			ansEle.append(suffix);
			myContent.appendChild(ansEle);
		});

		return myContent;
	}

	// https://developer.browser.com/docs/extensions/mv3/options/
	async function save_options() {
		const hlAnswers = document.getElementById("hlAnswers").checked;
		const srtAns = document.getElementById("srtAns").checked;
		const hlComments = document.getElementById("hlComments").checked;
		let stackMeData = {
			hlAns: hlAnswers,
			srtAns: srtAns,
			hlCmnts: hlComments,
		};
		browser.storage.sync.set({ stackMeData: stackMeData }).then(function () {
			UpdateStatus("Options Saved");
		});
	}

	// Restores select box and checkbox state using the preferences stored in browser.storage.
	function restore_options() {
		// https://developer.chrome.com/docs/extensions/mv3/options/
		browser.storage.sync.get({ stackMeData: defaultOptions }).then(function (result) {
			// if stackMeData is not found, use defaultOptions for a first time user
			UpdateUI(result.stackMeData);
		});
	}

	async function reset_options() {
		browser.storage.sync.set({ stackMeData: defaultOptions }).then(() => {
			// reset to defaultOptions
			UpdateUI(defaultOptions);
		});

		UpdateStatus("Options reset");
		restore_options;
	}

	function UpdateStatus(statusText) {
		// Update status to let user know options were saved.
		var status = document.getElementById("status");
		const statusSuffix = pageType != "options" ? " - Please reload the tab for accurate behaviour" : "";
		status.textContent = statusText + statusSuffix;
		status.style.visibility = "visible";
		setTimeout(function () {
			status.style.visibility = "hidden";
		}, 5000);
	}

	function UpdateUI(Options) {
		document.getElementById("hlAnswers").checked = Options.hlAns;
		document.getElementById("srtAns").checked = Options.srtAns;
		document.getElementById("hlComments").checked = Options.hlCmnts;

		if (pageType == "popup") {
			if (!Options.hlAns) {
				const msg = "highlighting answers is disabled";
				document.getElementById("ansList").title = msg;
				document.getElementById("ansOff").textContent = msg;
				document.getElementById("ansCount").textContent = "?";
			}

			if (!Options.hlCmnts) {
				const msg = "highlighting comments is disabled";
				document.getElementById("commList").title = msg;
				document.getElementById("commOff").textContent = msg;
				document.getElementById("commCount").textContent = "?";
			}
		}
	}

	function DisplayNotificaction(warningText, type) {
		let notifyEle = document.getElementById("notification");

		if (warningText == "" || pageType == "options") {
			notifyEle.style.display = "none";
		} else {
			notifyEle.textContent = warningText;
			notifyEle.style.display = "block";
			notifyEle.classList.add(type);
		}
	}

	function ExecuteScroll(tabId, eleID, type, offsetHeight) {
		if (manifestVer == 3) {
			//  reference: https://stackoverflow.com/a/70932186/6908282
			browser.scripting.executeScript({
				target: { tabId: tabId, allFrames: false },
				args: [eleID, type, offsetHeight + 10],
				func: scrollToTarget,
			});
		} else {
			browser.tabs.executeScript(tabId, {
				// firefox not working with import function
				// solved by explosing scrollToTarget globally: https://stackoverflow.com/a/39383274/6908282
				// reference: https://stackoverflow.com/a/73599962/6908282
				allFrames: false,
				code: "window.scrollToTarget('" + eleID + "', '" + type + "', " + (offsetHeight + 10) + "); ",
			});
		}
	}
</script>

<Popup {pageType} {isStackOverflow}>
	<Notification {warningType} {warningText} {glCurrTab} {ExecuteScroll} />
</Popup>

<style>
	:global(a.hidden) {
		background-color: darkgrey;
		/* margin: 2px; */
		padding: 0 3px;
		border-radius: 3px;
		/* color: white; */
		font-style: italic;
	}

	:global(a.hidden::before) {
		/* Reference: https://stackoverflow.com/a/52058198/6908282 */
		content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQElEQVR42qXKwQkAIAxDUUdxtO6/RBQkQZvSi8I/pL4BoGw/XPkh4XigPmsUgh0626AjRsgxHTkUThsG2T/sIlzdTsp52kSS1wAAAABJRU5ErkJggg==);
		margin: 0 3px 0 5px;
	}
</style>
