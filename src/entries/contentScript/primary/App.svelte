<script>
  import browser from "webextension-polyfill";

  import DockContent from "./Components/DockContent.svelte"
  import { defaultPreferances } from "~/utils/constants";

  import logo from "~/assets/logo.svg";

  const logoImageUrl = new URL(logo, import.meta.url).href;

  export let stackData;
  let dockHidden = false;
  let isGreenBorder = false;
  if((stackData.popupContent.answerList && stackData.popupContent.answerList.length > 0)||
  (stackData.popupContent.commentList && stackData.popupContent.commentList.length > 0)||
  (stackData.popupContent.linkData?.linkedQids && stackData.popupContent.linkData?.linkedQids.length > 0)){
    isGreenBorder = true;
  }

  const currPref = GetPreferences()
  currPref.then((savedPref)=>{
    dockHidden = savedPref.dockHidden
  })

  function ToggleDock(){
    dockHidden = !dockHidden;

    currPref.then((savedPref)=>{
      // console.log(savedPref);
      savedPref.dockHidden = dockHidden;

      browser.storage.sync.set({ stackMeData: savedPref }).then(function () {
		});
    })
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

</script>

<div id="dockRoot" class={dockHidden ? "dockHidden" : ""} >
  <div id="dockLogo" class:greenBorder={isGreenBorder}>
    <button type="button" on:click|preventDefault={() => ToggleDock()}>
      <img src={logoImageUrl} height="20" alt="Stack Me First Logo" 
      />
    </button>
  </div>

  {#await currPref then Options}
    {#if !dockHidden}
      <DockContent {stackData}/>
    {/if}
  {/await}


</div>



<style>
  #dockRoot{
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

  #dockRoot.dockHidden{
    padding: 0;
    top: 3px;
    border-radius: 100%;
  }
  #dockLogo {
    /* width: 30px; */
    /* height: 30px; */
    /* display: flex; */
    display: flex;
    justify-content: center;
    /* width: 30px; */
    height: 30px;
    aspect-ratio: 1;
    align-items: center;
    border: 3px solid firebrick; /* rgb(255, 255, 255, 50%); */
    border-radius: 50%;
    background-color: rgb(0, 0, 0, 70%);
    backdrop-filter: blur(5px);
    margin: 5px;
    position: relative;
    top: -5px;
    left: 20px;
    z-index: 1;
  }

  #dockLogo.greenBorder{
    border-color: forestgreen;
  }

  .dockHidden #dockLogo{
    position: unset;
  }

  #dockLogo button {
    cursor: pointer;
    height: inherit;
    background: none;
    border: none;
  }
  #dockLogo img{
    padding: 5px;
    height: 70%;
  }

</style>
