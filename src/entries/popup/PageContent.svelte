<script>
	import browser from "webextension-polyfill";
	// browser.storage.sync.clear(); // use this while development to clear any existing options
	// let console = browser.extension.getBackgroundPage().console;
	import Popup from "./Popup.svelte";
	import Notification from "./Notification.svelte";

	const manifestVer = Number(import.meta.env.VITE_MANIFEST_VERSION);
	import scrollToTarget from "../executeScript/executeScript";
	import { ignoreUrlList } from "~/utils/constants";

	let warningText;
	let warningType = new Set();
	let glCurrTab;

	// Once the DOM is ready...
	displayHTML();

	function displayHTML() {
		browser.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
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
			const baseURL = activeURL.protocol + "//" + activeURL.host + activeURL.pathname; // ref: https://stackoverflow.com/a/6257480/6908282
			let linkRef = "";
			if (type == "comment") {
				const quesId = activeURL.pathname.replace("/questions/", "").split("/")[0];
				linkRef = activeURL.href + "#" + eleID.replace("-", "") + "_" + quesId;
			}
			if (type == "answer") {
				const ref = eleID.replace("answer-", "");
				linkRef = baseURL + "/" + ref + "#" + ref;
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

<Popup>
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
