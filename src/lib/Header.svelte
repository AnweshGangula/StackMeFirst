<script>
	import browser from "webextension-polyfill";
	import Api from "~/utils/stackAPI";
	import { GetLocalTokenData } from "~/utils/utils";

	let stackAPI;
	let profileImage;
	let profileUrl;
	let token = false;
	let localToken = headerDOM();
	let loginError = false;

	async function headerDOM() {
		const tokenData = await GetLocalTokenData();
		token = tokenData.token;

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
					token = tokenMsg;
					const myData = await myStackDetails(tokenMsg);
					document.getElementById("btnLogout").title = myData.display_name;

					const apiData = {
						token: tokenMsg,
						userName: myData.display_name,
						profileImage: myData.profile_image,
						profileUrl: myData.link,
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

	async function myStackDetails(token) {
		stackAPI = new Api(token);
		const myData = await stackAPI.getMyDetails();
		profileImage = myData[0].profile_image;
		profileUrl = myData[0].link;

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

	{#await localToken then result}
		<div class="loginDiv">
			{#if token}
				<a
					id="profilePic"
					href={result.profileUrl}
					title={result.profileUrl}
					on:click|preventDefault={() => browser.tabs.create({ url: result.profileUrl })}
				>
					<img width="35" height="35" src={result.profileImage} alt="Stack Exchange Profile Pic of Gangula" />
				</a>
				<button id="btnLogout" on:click|preventDefault={() => RemoveToken(result.token)}>Logout</button>
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

	#profilePic img {
		border-radius: 100%;
		margin: 0 5px;
	}

	#loginError {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}
</style>
