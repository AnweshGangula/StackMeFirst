<script>
    import Popup from "../../../popup/Popup.svelte"

    export let stackData;
    console.log({stackData})
</script>

<div class="dockContent">
    <Popup {stackData} sidebar = {true}/>
</div>

<style>
.dockContent {
    /* height: 100vh; */
    /* max-width: 400px; */
    padding: 10px;
    /* background-color: rgba(0, 0, 0, 0.6); */
    /* backdrop-filter: blur(3px); */
    background-color: rgba(255, 255, 255, 0.8);
    color: black;
    backdrop-filter: blur(3px);
    border-radius: 5px;
}
</style>