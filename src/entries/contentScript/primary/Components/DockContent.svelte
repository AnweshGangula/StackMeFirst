<script>
	import browser from "webextension-polyfill";
	import { onMount } from "svelte";

	import PopupDock from "../../../popup/PopupDock.svelte";
	import Header from "~/lib/Header.svelte";

	import logo from "~/assets/logo.svg";

	import { defaultPreferances, devModeSuffix, pageTypeEnum } from "~/utils/constants";

	import DockMixpanel from "./mixpanelDock";

	export let stackData;
	const logoImageUrl = new URL(logo, import.meta.url).href;

	let devMode = import.meta.env.VITE_DEV_MODE == "true";

	const devAttribute = () => {
		// ref: https://stacktuts.com/how-to-have-a-conditional-attribute-in-svelte-3
    	return devMode ? { dataDevMode: devModeSuffix } : {};
  	}

	let dockSidebar = true;
	let isGreenBorder = false;
	let slideSidebar = true;
	let badgeTextList = GetBadgeText(stackData.popupContent);
	let badgeText = "0A,0C";
	let closing = false;
	let closingTimer = "";

	if (badgeTextList.length > 0) {
		isGreenBorder = true;
		badgeText = badgeTextList.join(",");
	}

	onMount(async () => {
		// const currPref = GetPreferences();
		// currPref.then((savedPref) => {
		// 	dockSidebar = savedPref.dockSidebar;
		// }).then(()=>{
		// 	// setTimeout(function() {
		// 	// slideSidebar = !dockSidebar;
		// 	// }, 500); // without setTimeout, the slide animation is snappy
		// });
	});

	let timeoutId;
	let time = 3;
	let startCount;

	function ToggleDock(openClose) {
		// console.log({openClose, slideSidebar})
		if (openClose !== "open") {
			closing = true;

			closingTimer = `closing in ${time} second${time == 1? "": "s"}`;
			const interval = 1;
			startCount = setInterval(function () {
				time -= interval;
				closingTimer = `closing in ${time} second${time == 1? "": "s"}`;
				if (time == 0) {
					closingTimer = "";
					time = 3;
					clearInterval(this);
				}
			}, interval * 1000);

			timeoutId = setTimeout(() => {
				slideSidebar = false;
				dockSidebar = true;
				closing = false;
				clearInterval(startCount);
			}, time * 1000);
		} else {
			clearTimeout(timeoutId);
			clearInterval(startCount);
			closing = false;
			closingTimer = "";
			time = 3;

			slideSidebar = true;
			dockSidebar = false;
		}

		// slideSidebar doesn't work right now
		// TODO: replace sliding with expand animation

		// if(openClose == "open"){
		// 	dockSidebar = false;
		// 		// GetPreferences().then((savedPref) => {
		// 		// 	// console.log(savedPref);
		// 		// 	savedPref.dockSidebar = dockSidebar;

		// 		// 	browser.storage.sync.set({ stackMeData: savedPref }).then(function () {});
		// 		// });
		// 	}
		// 	if(openClose == "close"){
		// 		dockSidebar = true;
		// 		// GetPreferences().then((savedPref) => {
		// 			// 	// console.log(savedPref);
		// 			// 	savedPref.dockSidebar = dockSidebar;

		// 			// 	browser.storage.sync.set({ stackMeData: savedPref }).then(function () {});
		// 			// });
		// 		}
	}

	async function GetPreferences() {
		var sotrageOpts = new Promise(function (resolve, reject) {
			// TODO: Replace Promise with Async-Await
			//  reference: https://stackoverflow.com/a/58491883/6908282
			browser.storage.sync
				.get({ stackMeData: defaultPreferances })
				.then(function (result) {
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
		if (
			popupContent.linkData?.hlLinkQ &&
			popupContent.linkData?.linkedQids &&
			popupContent.linkData?.linkedQids.length > 0
		) {
			badgeTextList.push(popupContent.linkData.linkedQids.length + "L");
		}

		return badgeTextList;
	}
</script>

<div
	id="dockRoot"
	class:devMode
	class={dockSidebar ? "dockSidebar" : ""}
	class:slideSidebar
	class:closing
	data-closing={closingTimer}
	data-devMode = {devMode ? devModeSuffix : null}
	on:click={(e) => DockMixpanel(e)}
	on:mouseleave={() => ToggleDock("close")}
	on:mouseenter={() => ToggleDock("open")}
>
	<!-- {#await currPref then Options} -->
	{#if !dockSidebar}
		<div id="dockContent" class="glassmorphic">
			<div id="dockContentChild">
				<Header pageType={pageTypeEnum.sidebar} />
				<!-- {#if badgeTextList.length > 0} -->
				<PopupDock {stackData} />
				<!-- {:else}
                <p id="noStack" class="featureOff">! This question doesn't have any answers/comments submitted by you.</p>
            {/if} -->
			</div>
		</div>
	{/if}
	<!-- {/await} -->
	<div id="dockLogo" class:greenBorder={isGreenBorder}>
		<!-- <button type="button" on:click|preventDefault={() => ToggleDock()}> -->
		<button type="button" on:mouseenter={() => ToggleDock("open")}>
			<span id="badgeText">
				<small class:greenBorder={isGreenBorder}>{badgeText}</small>
			</span>
			<img src={logoImageUrl} height="20" alt="Stack Me First Logo" />
		</button>
	</div>
</div>

<style>
	#dockRoot.devMode{
		border: 5px solid firebrick;
	}
	#dockRoot.devMode::before{
		content: attr(data-devMode); /* https://stackoverflow.com/a/59028650/6908282 */
		white-space: nowrap;
		position: absolute;
		padding: 3px;
		z-index: 1000;
		background: firebrick;
		left: -5px;
		top: -5px;
		border-radius: 5px;
	}
	#dockRoot {
		position: fixed;
		z-index: 9999;
		top: 30px;
		right: 0;
		/* margin: 10px; */
		display: flex;
		/* max-width: 500px; */
		padding: 5px;
		/* transition: border-radius 250ms ease-in; */ /* TODO: work on transition later*/
	}

	#dockRoot.closing::before {
		content: attr(data-closing);
		position: absolute;
		top: 25px;
		left: 10px;
		z-index: 100;
		color: white;
		background-color: firebrick;
		padding: 0 5px;
		border-radius: 5px;
	}

	@media (max-width: 1400px) {
		#dockRoot {
			top: 50px;
		}
	}
	#dockContent {
		/* position: absolute; */
		/* height: 100vh; */
		width: 450px;
		/* max-width: 450px; */
		max-height: 80vh;
		overflow: hidden auto;
		top: 20px;
		left: 100px;
		/* padding: 10px; */
		margin-top: 15px;
		/* background-color: rgba(0, 0, 0, 0.6); */
		/* backdrop-filter: blur(3px); */
		background-color: rgba(255, 255, 255, 0.8);
		color: black;
		/* backdrop-filter: blur(3px); */
		border-radius: 5px;
		transform: scaleX(1.5) translateX(120%); /* this adds more realistic sliding animation - like a cartoon speedcar stop */
		transition: transform 1s cubic-bezier(0.82, -0.4, 0.19, 1.4),
			left 1s cubic-bezier(0.82, -0.4, 0.19, 1.4);
	}

	#dockRoot.slideSidebar > #dockContent {
		/* transform: translateX(-142%); */
		transform: scaleX(1) translate(0%);
		left: 0;
	}

	#dockContent.glassmorphic {
		/* color: var(--theme-body-font-color); */
		background: rgb(255 255 255 / 25%);
		background: linear-gradient(45deg, #00ff908a, rgb(0 184 255 / 50%));
		background-image: linear-gradient(
			135deg,
			rgb(46 255 228 / 50%) 10%,
			rgb(240 103 180 / 50%) 100%
		);
		border-radius: 10px;
		/* box-shadow: 5px 4px 1px rgb(94 233 202 / 20%); */
		/* backdrop-filter: blur(9px); */
		/* -webkit-backdrop-filter: blur(9px); */
		outline: 1px solid rgb(255 255 255 / 40%);
	}

	#dockContentChild {
		position: relative;
		background: #ffffff4a;
		backdrop-filter: blur(3px);
		padding: 10px;
		border-radius: 10px;
		margin: auto;
		/* border: 1px solid lightgray; */
	}

	#dockContentChild::before {
		content: "";
		z-index: -1;
		position: absolute;
		inset: 0px; /* -2px; */
		/* top: 0;
		left: 0;
		right: 0;
		bottom: 0; */
		border-radius: 10px;
		border: 2px solid transparent;
		background: linear-gradient(45deg, purple, orange) border-box;
		-webkit-mask: linear-gradient(#fff 0 0) padding-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: destination-out;
		mask-composite: exclude;
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
		display: flex;
		justify-content: center;
		height: fit-content;
		/* aspect-ratio: 1; */
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
		width: 30px;
		height: 30px;
		cursor: pointer;
		background: none;
		border: none;
	}
	#dockLogo img {
		/* padding: 5px; */
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
