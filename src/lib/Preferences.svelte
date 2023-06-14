<script>
	import browser from "webextension-polyfill";
	import { restore_options, UpdateUI } from "~/entries/popup/popupUtils";
	import { defaultPreferances, pageTypeEnum } from "~/utils/constants";

	export let pageType = "";

	restore_options(pageType);

	// https://developer.browser.com/docs/extensions/mv3/options/
	async function save_options() {
		const hlAnswers = document.getElementById("hlAnswers").checked;
		const srtAns = document.getElementById("srtAns").checked;
		const hlComments = document.getElementById("hlComments").checked;
		const hlLinkQs = document.getElementById("hlLinkQs").checked;
		const displaySidebar = document.getElementById("displaySidebar").checked;
		const dockSidebar = document.getElementById("dockSidebar").checked;
		let stackMeData = {
			hlAns: hlAnswers,
			srtAns: srtAns,
			hlCmnts: hlComments,
			hlLinkQs: hlLinkQs,
			displaySidebar: displaySidebar,
			dockSidebar: dockSidebar,
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
		const statusSuffix = pageType != pageTypeEnum.options ? " - Please reload the tab for accurate behaviour" : "";
		status.textContent = statusText + statusSuffix;
		status.style.visibility = "visible";
		setTimeout(function () {
			status.style.visibility = "hidden";
		}, 5000);
	}
</script>

<div id="config">
	<form id={pageTypeEnum.options}>
		<fieldset>
			<legend>User Preferences</legend>

			<div>
				<input type="checkbox" id="hlAnswers" name="hlAnswers" value="Highlight my Answers" />
				<label for="hlAnswers">Highlight my Answers</label>
			</div>
			<div>
				<input type="checkbox" id="srtAns" name="srtAns" value="Bring My Answers to Top" />
				<label for="srtAns">Bring My Answers to Top</label>
				<br />
			</div>
			<hr />
			<div>
				<input type="checkbox" id="hlComments" name="hlComments" value="Highlight Comments" />
				<label for="hlComments">Highlight my Comments</label>
				<br />
			</div>
			<hr />
			<div>
				<input type="checkbox" id="hlLinkQs" name="hlLinkQs" value="Highlight LinkQs" />
				<label for="hlLinkQs">Highlight Upvoted Linked Questions</label>
				<i id="loginTooltip" class="infoTooltip" title="Needs StackOverflow Login">i</i>
				<br />
			</div>
			<hr />
			<div>
				<input type="checkbox" id="displaySidebar" name="displaySidebar" value="Display Dock" />
				<label for="displaySidebar">Display the dockable sidebar</label>
				<i id="sidebarTooltip" class="infoTooltip" title="Displays a collapsible sidebar within the Stack-Overflow page">i</i>
			</div>
			<div style="display: none;">
				<!-- this is needed to save the dockSidebar property during save_options function - since it used DOM to save each option -->
				<input type="checkbox" id="dockSidebar" name="dockSidebar" value="Dock Sidebar" />
				<label for="dockSidebar">Dock sidebar on page load</label>
				<i id="dockTooltip" class="infoTooltip" title="Hides the sidebar on page load. Only the logo is displayed">i</i>
				<br />
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

	hr {
		/* reference: https://stackoverflow.com/a/5619906/6908282 */
		margin-top: 5px;
		height: 0.1px;
		border: none;
		background: lightgray;
	}

	#buttons {
		margin: 10px;
		text-align: end;
	}

	#status {
		visibility: hidden;
		color: darkgreen;
		background-color: darkseagreen;
		margin: 5px;
		padding: 5px;
	}

	.infoTooltip {
		cursor: default;
		border-radius: 100%;
		background-color: firebrick;
		font-size: smaller;
		padding: 0 6px;
		color: white;
	}
</style>
