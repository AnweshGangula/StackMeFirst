<script>
	import browser from "webextension-polyfill";

	export let profileData;
</script>

<a
	id="profilePic"
	href={profileData.profileUrl}
	title={profileData.profileUrl}
	on:click|preventDefault={() => browser.tabs.create({ url: profileData.profileUrl })}
>
	<img width="35" height="35" src={profileData.profileImage} alt="Stack Exchange Profile Pic of Gangula" />
</a>

<style>
	#profilePic img {
		border-radius: 100%;
		margin: 0 5px;
	}
</style>
