<div id="config">
	<form id="options">
		<fieldset>
			<legend>User Preferences</legend>

			<div>
				<input type="checkbox" id="hlAnswers" name="hlAnswers" value="Highlight my Answers" />
				<label for="hlAnswers">Highlight my Answers</label>
			</div>
			<div>
				<input type="checkbox" id="srtAns" name="srtAns" value="Bring My Answers to Top" />
				<label for="srtAns">Bring My Answers to Top</label><br />
			</div>
			<br />
			<div>
				<input type="checkbox" id="hlComments" name="hlComments" value="Highlight Comments" />
				<label for="hlComments">Highlight my Comments</label><br />
			</div>
		</fieldset>
	</form>

	<div id="buttons">
		<button id="btnSave" type="button">Save</button>
		<button id="btnReset" type="button">Reset</button>
	</div>

	<p id="status" />
</div>

<style>
	input {
		margin-left: 5px;
	}

	#buttons {
		margin: 10px;
		text-align: end;
	}

	#status {
		visibility: hidden;
		color: green;
		background-color: darkseagreen;
		margin: 5px;
		padding: 5px;
	}
</style>
