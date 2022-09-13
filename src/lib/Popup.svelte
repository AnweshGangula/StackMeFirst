<script>
	import browser from "webextension-polyfill";
	import Api from "~/utils/stackAPI";
	import Preferences from "~/lib/Preferences.svelte";

	let stackAPI;
	let loggedIn = false;
	async function login() {
		// this.setState({ loading: true });
		alert("Sending Message to backgroundScript to login");

		browser.runtime
			.sendMessage({
				from: "popup",
				subject: "AUTH",
			})
			.then(async ({ token, error }) => {
				console.log(`Action 'AUTH' success`);
				if (token) {
					// console.log("Logged in");
					loggedIn = true;
					stackAPI = new Api(token);
					const myData = await stackAPI.getMyDetails();
					document.getElementById("btnUserName").textContent = myData[0].display_name;

					const apiData = {
						token: token,
						userName: myData[0].display_name,
					};
					browser.storage.sync.set({ apiData: apiData }).then(function () {
						// UpdateStatus("Options Saved");
					});
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

	{#if loggedIn}
		<button id="btnUserName" class="loginBtn" on:click|preventDefault>Logged in</button>
	{:else}
		<button id="btnLogin" class="loginBtn" on:click|preventDefault={() => login()}>Login</button>
	{/if}
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

	<Preferences />
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

	#logo {
		margin: 5px;
	}

	hr {
		/* reference: https://stackoverflow.com/a/5619906/6908282 */
		margin-top: 5px;
		height: 2px;
		border: none;
		background: lightgray;
	}
	.featureOff {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}

	.loginBtn {
		margin-left: auto;
	}
</style>
