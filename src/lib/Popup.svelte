<script>
	import browser from "webextension-polyfill";

	async function login() {
		// this.setState({ loading: true });
		browser.runtime
			.sendMessage({
				from: "popup",
				subject: "AUTH",
			})
			.then(({ token, error }) => {
				console.log(`Action 'AUTH' success`);
				if (token) {
					console.log("Logged in");
					// this.api = new Api(token);
					// this.setState({ token, view: VIEWS.DEFAULT });
				} else {
					console.log("Unable to login");
					// this.setState({ error });
				}
			});
		// return true;
	}

	export let pageType = "popup";
	export let isStackOverflow = true;
</script>

<header>
	<img id="logo" src="/icons/StackMeFirst.png" alt="Stack Me First Logo" width="20" height="20" />
	<h1>Stack Me First</h1>
	<button on:click|preventDefault={() => login()}>Login</button>
</header>

<main>
	<slot />
	{#if pageType == "popup" && isStackOverflow}
		<div id="myStack">
			<details id="ansList" open>
				<summary>
					<b><span id="ansCount">0</span> Answer/s</b> posted by you:
				</summary>

				<p id="ansOff" class="featureOff" />
			</details>

			<details id="commList" open>
				<summary>
					<b><span id="commCount">0</span> Comment/s</b> posted by you:
				</summary>
				<p id="commOff" class="featureOff" />
			</details>
			<hr />
		</div>
	{/if}

	<div id="config">
		<form id="options">
			<fieldset>
				<legend>Configure Settings</legend>

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
			<button id="btnSave" type="button">Save</button>
			<button id="btnReset" type="button">Reset</button>
		</div>

		<p id="status" />
	</div>
</main>

<style>
	:global(body) {
		width: 350px;
		/* height: 300px; */
	}

	:global(header) {
		display: flex;
		align-items: center;
	}

	:global(#logo) {
		margin: 5px;
	}

	input {
		margin-left: 5px;
	}

	hr {
		/* reference: https://stackoverflow.com/a/5619906/6908282 */
		margin-top: 5px;
		height: 2px;
		border: none;
		background: lightgray;
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

	.featureOff {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}
</style>
