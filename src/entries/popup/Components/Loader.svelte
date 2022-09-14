<div id="loading">
	<p>loading</p>
	<div id="loader" />
</div>

<style>
	#loading {
		display: flex;
		align-content: center;
		justify-content: center;
		background-color: blanchedalmond;
		color: orangered;
		text-align: center;
		font-size: 16px;
		font-weight: 700;
	}

	#loader {
		/* reference: https://www.w3schools.com/howto/howto_css_loader.asp */
		border: 5px solid #f3f3f3;
		border-radius: 50%;
		border-top: 5px solid orangered;
		width: 10px;
		height: 10px;
		margin: auto 10px;
		-webkit-animation: spin 2s linear infinite; /* Safari */
		animation: spin 2s linear infinite;
	}

	/* Safari */
	@-webkit-keyframes spin {
		0% {
			-webkit-transform: rotate(0deg);
		}
		100% {
			-webkit-transform: rotate(360deg);
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
