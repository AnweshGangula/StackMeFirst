<script>
	import browser from "webextension-polyfill";

	export let pageType = "";

	let defaultOptions = {
		hlAns: true,
		srtAns: true,
		hlCmnts: false,
	};
	restore_options();

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
</script>

<div id="config">
	<form id="options">
		<fieldset>
			<legend>User Preferences</legend>

			<div>
				<input type="checkbox" id="hlAnswers" name="hlAnswers" value="Highlight my Answers" />
				<label for="hlAnswers">Highlight my Answers</label>
			</div>
			<div>
				<input type="checkbox" id="srtAns" name="srtAns" value="Bring My Answers to Top" />
				<label for="srtAns">Bring My Answers to Top</label><br />
			</div>
			<br />
			<div>
				<input type="checkbox" id="hlComments" name="hlComments" value="Highlight Comments" />
				<label for="hlComments">Highlight my Comments</label><br />
			</div>
		</fieldset>
	</form>

	<div id="buttons">
		<button id="btnSave" on:click|preventDefault={() => save_options()}>Save</button>
		<button id="btnReset" on:click|preventDefault={() => reset_options()}>Reset</button>
	</div>

	<p id="status" />
</div>

<style>
	input {
		margin-left: 5px;
	}

	#buttons {
		margin: 10px;
		text-align: end;
	}

	#status {
		visibility: hidden;
		color: green;
		background-color: darkseagreen;
		margin: 5px;
		padding: 5px;
	}
</style>
