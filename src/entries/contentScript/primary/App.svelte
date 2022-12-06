<script>
  import browser from "webextension-polyfill";

  import DockContent from "./Components/DockContent.svelte"
  import { defaultPreferances } from "~/utils/constants";

  import logo from "~/assets/logo.svg";

  const logoImageUrl = new URL(logo, import.meta.url).href;

  let dockHidden = false;
  const currPref = GetPreferences()
  currPref.then((savedPref)=>{
    dockHidden = savedPref.dockHidden
  })

  async function ToggleDock(){
    dockHidden = !dockHidden;

    await currPref.then((savedPref)=>{
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
  <div class="dockLogo">
    <button type="button" on:click|preventDefault={() => ToggleDock()}>
      <img src={logoImageUrl} height="20" alt="Stack Me First Logo" 
      />
    </button>
  </div>

  {#await currPref then Options}
    {#if !dockHidden}
      <DockContent />
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
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
    border-radius: 5px;
    /* transition: border-radius 250ms ease-in; */ /* TODO: work on transition later*/
  }

  #dockRoot.dockHidden{
    padding: 0;
    top: 3px;
    border-radius: 100%;
  }
  .dockLogo {
    /* width: 30px; */
    /* height: 30px; */
    /* display: flex; */
    display: flex;
    justify-content: center;
    /* width: 30px; */
    height: 30px;
    aspect-ratio: 1;
    align-items: center;
    border: 3px solid rgb(255,255,255,20%);
    border-radius: 50%;
    background-color: #0000004d;
    margin: 5px;
  }

  .dockLogo button {
    cursor: pointer;
    height: inherit;
    background: none;
    border: none;
  }
  .dockLogo img{
    padding: 5px;
    height: 70%;
  }

</style>
