<script>
	import browser from "webextension-polyfill";
	// browser.storage.sync.clear(); // use this while development to clear any existing options
	// let console = browser.extension.getBackgroundPage().console;
	import Popup from "./Popup.svelte";

	export let pageType = "popup";

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
			let activeURL = new URL(activeTab.url);
			let currURL = activeURL.href; // .at(-1)
			let website = activeURL.host;
			let URLpathname = activeURL.pathname;
			const isStackOverflow = website == "stackoverflow.com";
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
				DisplayNotificaction("! Please Open a Stack Overflow website to use this addin.");
			}
		});
	}

	// Update the relevant fields with the new data.
	function SetPopupContent(currTab, info) {
		//  reference: https://stackoverflow.com/a/20023723/6908282
		const metaData = info.metaData;
		if (metaData.currUser == undefined) {
			DisplayNotificaction("! Login to Stack Overflow to highlight your answers");
			return;
		}

		if (info.commentList.length == 0 && info.answerList.length == 0) {
			DisplayNotificaction("! This question doesn't have any answers/comments submitted by you.");
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
			let ansEle = document.createElement("li");
			let link = document.createElement("a");
			link.textContent = eleID;

			let activeURL = new URL(tab.url);
			let linkRef = "";
			if (type == "comment") {
				linkRef = activeURL.href + eleID;
			}
			if (type == "answer") {
				const ref = eleID.replace("answer-", "");
				linkRef = activeURL.href + "/" + ref + "#" + ref;
			}
			link.setAttribute("href", linkRef);
			link.addEventListener("click", function () {
				window.event.preventDefault();
				ExecuteScroll(tab.id, eleID, type, offsetHeight);
			});

			ansEle.appendChild(link);
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
		const statusSuffix = pageType == "options" ? "" : " - Please reload the tab for accurate behaviour";
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

		if (pageType != "options") {
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

	function DisplayNotificaction(warningText) {
		if (warningText == "" || pageType == "options") {
			document.getElementById("notification").style.display = "none";
		} else {
			document.getElementById("notification").style.display = "block";
			document.getElementById("notification").textContent = warningText;
		}
	}

	function ExecuteScroll(tabId, eleID, type, offsetHeight) {
		//  reference: https://stackoverflow.com/a/70932186/6908282
		browser.scripting.executeScript({
			target: { tabId: tabId, allFrames: false },
			args: [eleID, type, offsetHeight + 10],
			func: scrollToTarget,
		});
	}

	function scrollToTarget(eleId, type, headerHeight = 40) {
		// reference: https://stackoverflow.com/a/67647864/6908282
		// this function is being used in popupjs for sctoll to the answer/comment clicked dby the user
		let element = document.getElementById(eleId);
		element.classList.add("highlighted-post"); // CSS class 'highlighted-post' has a animation called

		if (type == "comment") {
			element = document.getElementById(eleId).getElementsByClassName("comment-text")[0];
			element.style.backgroundColor = "var(--yellow-100)"; // comments have a transition for backgroundColor. So settimeout to remove backgroundcolor triggers that's transition
		}
		const elementPosition = element.getBoundingClientRect().top;
		const offsetPosition = elementPosition - headerHeight;

		window.scrollBy({
			top: offsetPosition,
			behavior: "smooth",
		});

		setTimeout(function () {
			element.classList.remove("highlighted-post");
			element.style.backgroundColor = "";
		}, 3000);
	}
</script>

<Popup {pageType} />

<style>
</style>
