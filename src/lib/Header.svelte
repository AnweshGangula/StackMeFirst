<script>
	import browser from "webextension-polyfill";
	import Api from "~/utils/stackAPI";
	import { GetLocalToken } from "~/utils/utils";

	let stackAPI;
	let localToken = GetLocalToken();
	let loginError = false;

	async function login() {
		// this.setState({ loading: true });

		browser.runtime
			.sendMessage({
				from: "popup",
				subject: "GET_TOKEN",
			})
			.then(async ({ token, error }) => {
				console.log(`Action 'AUTH' success`);
				if (token) {
					// console.log("Logged in");
					localToken = token;
					stackAPI = new Api(token);
					const myData = await stackAPI.getMyDetails();
					document.getElementById("btnLogout").title = myData[0].display_name;

					const apiData = {
						token: token,
						userName: myData[0].display_name,
					};
					browser.storage.sync.set({ apiData: apiData }).then(function () {
						// UpdateStatus("Options Saved");
					});
				} else {
					loginError = true;
					// console.log("Unable to login");
					// this.setState({ error });
				}
			});
		// return true;
	}

	async function RemoveToken(tokenVar) {
		browser.runtime
			.sendMessage({
				from: "popup",
				subject: "REMOVE_TOKEN",
				content: { token: tokenVar },
			})
			.then(({ error }) => {
				if (!error) {
					console.log(`Action 'REMOVE_TOKEN' success`);
					localToken = false;
				} else {
					//  unable to remove token
				}
			});
	}
</script>

<header>
	<img id="logo" src="/icons/StackMeFirst.png" alt="Stack Me First Logo" width="20" height="20" />
	<h1>Stack Me First</h1>
	{#if loginError}
		<p id="loginError">Unable to Login. Please Try Again</p>
	{/if}

	{#await localToken then token}
		{#if token}
			<button id="btnLogout" class="loginBtn" on:click|preventDefault={() => RemoveToken(token)}>Logout</button>
		{:else}
			<button id="btnLogin" class="loginBtn" on:click|preventDefault={() => login()} title="Click to Login to Stack Overflow for enhanced insights">
				Login
			</button>
		{/if}
	{/await}
</header>

<style>
	header {
		display: flex;
		align-items: center;
	}

	#logo {
		margin: 5px;
	}

	.loginBtn {
		margin-left: auto;
	}

	#loginError {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}
</style>
