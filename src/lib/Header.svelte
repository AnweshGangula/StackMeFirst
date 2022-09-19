<script>
	import browser from "webextension-polyfill";
	import Api from "~/utils/stackAPI";
	import { GetLocalTokenData } from "~/utils/utils";

	import ProfilePic from "./ProfilePic.svelte";

	let token = false;
	let domData = headerDOM();
	let loginError = false;
	let profileData;

	async function headerDOM() {
		const tokenData = await GetLocalTokenData();
		token = tokenData.token;
		profileData = tokenData;

		return tokenData;
	}

	async function login() {
		// this.setState({ loading: true });

		browser.runtime
			.sendMessage({
				from: "popup",
				subject: "GET_TOKEN",
			})
			.then(async ({ token: tokenMsg, error }) => {
				console.log(`Action 'AUTH' success`);
				if (tokenMsg) {
					// console.log("Logged in");
					const myData = await myStackDetails(tokenMsg);

					const apiData = {
						token: tokenMsg,
						userName: myData.display_name,
						profileImage: myData.profile_image,
						profileUrl: myData.link,
					};

					profileData = apiData;
					browser.storage.sync.set({ apiData: apiData }).then(function () {
						token = tokenMsg;
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

	async function myStackDetails(token) {
		const stackAPI = new Api(token);
		const myData = await stackAPI.getMyDetails();

		return myData[0];
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
					token = false;
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

	{#await domData then result}
		<div class="loginDiv">
			{#if token}
				<ProfilePic {profileData} />
				<button id="btnLogout" title={profileData.userName} on:click|preventDefault={() => RemoveToken(result.token)}>Logout</button>
			{:else}
				<button id="btnLogin" on:click|preventDefault={() => login()} title="Click to Login to Stack Overflow for enhanced insights"> Login </button>
			{/if}
		</div>
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

	.loginDiv {
		margin-left: auto;
		display: flex;
		align-items: center;
	}

	#loginError {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}
</style>
