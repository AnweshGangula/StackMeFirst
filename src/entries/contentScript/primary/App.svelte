<script>
  import DocContent from "./Components/DocContent.svelte"

  import logo from "~/assets/logo.svg";

  const logoImageUrl = new URL(logo, import.meta.url).href;
</script>

<div class="dockRoot">
  <div class="dockLogo">
    <img src={logoImageUrl} height="20" alt="Stack Me First Logo" />
  </div>
  <DocContent />
</div>



<style>
  .dockRoot{
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

  .dockLogo img{
    padding: 5px;
    height: 70%;
  }

</style>
