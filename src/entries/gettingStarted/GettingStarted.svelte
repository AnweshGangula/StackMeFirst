<script>
  import { SvelteToast } from "@zerodevx/svelte-toast";

  console.log("Getting Started");

  const urlParams = new URLSearchParams(window.location.search);
  const domain = urlParams.get('domain');
</script>
<div id="GettingStarted_Root">
  <h1>Getting Started</h1>
    <p>Domain: {domain}</p>
</div>

<style>
  #Sidebar_Root {
    --toastWidth: 24rem;
    --toastBackground: blanchedalmond;
    --toastColor: #424242;
    --toastBarBackground: brown;
    --toastContainerTop: auto;
    --toastContainerRight: 1rem;
    --toastContainerBottom: 2rem;
    /* --toastContainerLeft: calc(50vw - 8rem); */
  }
</style>
