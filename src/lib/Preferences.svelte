<script>
	import browser from "webextension-polyfill";
	import { restore_options, UpdateUI } from "~/entries/popup/popupUtils";
	import { defaultPreferances } from "~/utils/constants";

	export let pageType = "";

	restore_options(pageType);

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
			UpdateUI(stackMeData, pageType);
		});
	}

	async function reset_options() {
		browser.storage.sync.set({ stackMeData: defaultPreferances }).then(() => {
			// reset to defaultPreferances
			UpdateUI(defaultPreferances, pageType);
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
