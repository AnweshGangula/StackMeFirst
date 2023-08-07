import App from "./App.svelte";

if(import.meta.env.VITE_DEV_MODE == "true"){
  document.body.classList.add("devmode");
} 

new App({
  target: document.body,
});
