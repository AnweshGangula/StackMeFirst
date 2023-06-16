<script>
	import browser from "webextension-polyfill";
	import Api from "~/utils/stackAPI";
	import { GetLocalTokenData } from "~/utils/utils";
	import { pageTypeEnum } from "~/utils/constants";

	import ProfilePic from "./ProfilePic.svelte";

	export let pageType;
	let token = false;
	let domData = headerDOM();
	let loginError = false;
	let profileData;
	let loading = "";
	let logoUrl = browser.runtime.getURL("/icons/StackMeFirst.png");
	// console.log(logoUrl);

	const docsUrl = "https://github.com/AnweshGangula/StackMeFirst#stackmefirst";
	const helpURL = "https://github.com/AnweshGangula/StackMeFirst/discussions";

	async function headerDOM() {
		const tokenData = await GetLocalTokenData();
		token = tokenData.token;
		profileData = tokenData;

		return tokenData;
	}

	async function login() {
		// this.setState({ loading: true });
		loading = "loading";

		browser.runtime
			.sendMessage({
				from: pageTypeEnum.popup,
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
						loading = "";
					});
					const linQOffDOM = document.getElementById("linQLogin");
					if (linQOffDOM) {
						linQOffDOM.textContent = "Please reload the tab to get Linked Questions";
						linQOffDOM.classList.remove("loading");
					}
				} else {
					loginError = true;
					// console.log("Unable to login");
					// this.setState({ error });
				}
			});
		// return true;
	}

	function onClickEvent(url) {

		if(pageType == pageTypeEnum.sidebar){
			window.open(url)
		}else{
			browser.tabs.create({ url });
		}

	}

	async function myStackDetails(token) {
		const stackAPI = new Api(token);
		const myData = await stackAPI.getMyDetails();

		return myData[0];
	}

	async function RemoveToken(tokenVar) {
		browser.runtime
			.sendMessage({
				from: pageTypeEnum.popup,
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
	<img id="logo" src={logoUrl} alt="Stack Me First Logo" width="20" height="20" />
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
				<button id="btnLogin" class={loading} on:click|preventDefault={() => login()} title="Click to Login to Stack Overflow for enhanced insights">
					Login
				</button>
			{/if}
		</div>
	{/await}

	<div id="docsHelp">
		<a href={docsUrl} on:click|preventDefault={() => onClickEvent(docsUrl)}>
			<button 
				type="button"
				title="Documentation" >
				Docs
			</button>
		</a>
		<a href={helpURL} on:click|preventDefault={() => onClickEvent(helpURL)}>
			<button
				type="button" 
				title="Help/Feedback" >
				Help
			</button>
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	#docsHelp{
		width: 100%; 
		display: flex; 
		gap: 5px; 
		justify-content: flex-end;
	}

	#logo {
		margin: 5px;
	}

	h1{
		margin-right: 1em;
		white-space: nowrap;
	}

	.loginDiv {
		margin-left: auto;
		display: flex;
		align-items: center;
	}

	header button{
		cursor: pointer;
	}

	#loginError {
		background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center;
	}

	#btnLogin.loading {
		pointer-events: none;
	}

	#btnLogin.loading:after {
		overflow: hidden;
		display: inline-block;
		vertical-align: bottom;
		-webkit-animation: ellipsis steps(4, end) 900ms infinite;
		animation: ellipsis steps(4, end) 900ms infinite;
		content: "\2026";
		/* ascii code for the ellipsis character */
		width: 0px;
	}

	@keyframes ellipsis {
		to {
			width: 10px;
		}
	}

	@-webkit-keyframes ellipsis {
		to {
			width: 10px;
		}
	}
</style>
