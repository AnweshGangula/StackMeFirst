<script>
	import browser from "webextension-polyfill";

	import PopupDock from "../../../popup/PopupDock.svelte";
    import Header from "~/lib/Header.svelte";

	import logo from "~/assets/logo.svg";

	import { defaultPreferances } from "~/utils/constants";

	export let stackData;
	const logoImageUrl = new URL(logo, import.meta.url).href;

	let dockSidebar = false;
	let isGreenBorder = false;
	let badgeTextList = GetBadgeText(stackData.popupContent);
	let badgeText = "0A,0C";

	if (badgeTextList.length > 0) {
		isGreenBorder = true;
		badgeText = badgeTextList.join(",");
	}

	const currPref = GetPreferences();
	currPref.then((savedPref) => {
		dockSidebar = savedPref.dockSidebar;
	});

	function ToggleDock() {
		dockSidebar = !dockSidebar;

		currPref.then((savedPref) => {
			// console.log(savedPref);
			savedPref.dockSidebar = dockSidebar;

			browser.storage.sync.set({ stackMeData: savedPref }).then(function () {});
		});
	}

	async function GetPreferences() {
		var sotrageOpts = new Promise(function (resolve, reject) {
			// TODO: Replace Promise with Async-Await
			//  reference: https://stackoverflow.com/a/58491883/6908282
			browser.storage.sync.get({ stackMeData: defaultPreferances }).then(function (result) {
				// You can set default for values not in the storage by providing a dictionary:
				// reference: https://stackoverflow.com/a/26898749/6908282
				// if stackMeData is not found, use defaultPreferances for a first time user
				if (result) {
					resolve(result.stackMeData);
				} else {
					reject(new Error("throw"));
				}
			});
		});
		const savedPref = await sotrageOpts;
		return savedPref;
	}

	function GetBadgeText(popupContent) {
		let badgeTextList = [];

		if (popupContent.answerList && popupContent.answerList.length > 0) {
			badgeTextList.push(popupContent.answerList.length + "A");
		}
		if (popupContent.commentList && popupContent.commentList.length > 0) {
			badgeTextList.push(popupContent.commentList.length + "C");
		}
		if (popupContent.linkData?.hlLinkQ && popupContent.linkData?.linkedQids && popupContent.linkData?.linkedQids.length > 0) {
			badgeTextList.push(popupContent.linkData.linkedQids.length + "L");
		}

		return badgeTextList;
	}
</script>

<div id="dockRoot" class={dockSidebar ? "dockSidebar" : ""}>
	{#await currPref then Options}
		{#if !dockSidebar}
        <div class="dockContent">
            <Header />
			{#if badgeTextList.length > 0}
                <PopupDock {stackData} />
            {:else}
                <p id="noStack" class="featureOff">! This question doesn't have any answers/comments submitted by you.</p>
            {/if}
        </div>
		{/if}
	{/await}
	<div id="dockLogo" class:greenBorder={isGreenBorder}>
		<button type="button" on:click|preventDefault={() => ToggleDock()}>
			<span id="badgeText">
				<small class:greenBorder={isGreenBorder}>{badgeText}</small>
			</span>
			<img src={logoImageUrl} height="20" alt="Stack Me First Logo" />
		</button>
	</div>
</div>

<style>
	#dockRoot {
		position: fixed;
		z-index: 9999;
		top: 0px;
		right: 0px;
		/* margin: 10px; */
		display: flex;
		max-width: 400px;
		padding: 5px;
		/* transition: border-radius 250ms ease-in; */ /* TODO: work on transition later*/
	}

    .dockContent {
		/* height: 100vh; */
		/* max-width: 400px; */
		padding: 10px;
		margin-top: 5px;
		/* background-color: rgba(0, 0, 0, 0.6); */
		/* backdrop-filter: blur(3px); */
		background-color: rgba(255, 255, 255, 0.8);
		color: black;
		backdrop-filter: blur(3px);
		border-radius: 5px;
	}

	.featureOff {
        margin: 10px 0;
        padding: 5px;
        background-color: #ffe4e1;
        color: #b22222;
        border: 1px solid firebrick;

		/* background-color: firebrick;
		color: white;
		padding: 0 5px;
		text-align: center; */
	}

	#dockLogo {
		/* width: 30px; */
		height: 30px;
		display: flex;
		justify-content: center;
		aspect-ratio: 1;
		align-items: center;
		border: 3px solid firebrick; /* rgb(255, 255, 255, 50%); */
		border-radius: 50%;
		background-color: rgb(0, 0, 0, 70%);
		backdrop-filter: blur(5px);
		margin: 2px;
		margin-left: -10px;
		position: relative;
		/* top: -5px;
    left: 20px; */
		z-index: 1;
	}

	/* .dockSidebar #dockLogo{
    position: unset;
  } */

	#dockLogo button {
		cursor: pointer;
		height: inherit;
		background: none;
		border: none;
	}
	#dockLogo img {
		padding: 5px;
		height: 70%;
	}

	#badgeText {
		color: white;
		position: absolute;
		left: 5px;
		top: -5px;
		display: flex;
		justify-content: flex-end;
		width: 2px;
	}
	#badgeText small {
		background: firebrick;
		padding: 2px 5px;
		border: 1px solid dimgray;
		border-radius: 100vw;
	}

	#dockLogo.greenBorder {
		border-color: forestgreen;
	}

	#badgeText .greenBorder {
		background-color: forestgreen;
	}

</style>
