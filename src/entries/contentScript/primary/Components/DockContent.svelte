<script>
    import PopupDock from "../../../popup/PopupDock.svelte"

    export let stackData;
</script>

<div class="dockContent">
    <PopupDock {stackData}/>
</div>

<style>
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
</style>