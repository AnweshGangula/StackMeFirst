<script>
	import browser from "webextension-polyfill";

	import Api from "~/utils/stackAPI";
	import { QuesIdUrl } from "~/utils/utils";

	let linkedQ = [];
	const apiData = {
		token: "",
		userName: "",
	};
	const upvotedLinks = GetUpvotedLinks();

	async function GetUpvotedLinks() {
		await browser.storage.sync.get({ apiData: apiData }).then(async function (result) {
			const token = result.apiData.token;

			if (token != "") {
				await browser.tabs.query({ active: true, lastFocusedWindow: true }).then(async function (tabs) {
					const quesId = QuesIdUrl(tabs[0].url);

					const stackApi = new Api(token);
					const allLinkedQs = await stackApi.getLinkedQues(quesId);
					console.log(allLinkedQs);

					allLinkedQs.forEach((ques) => {
						if (ques.upvoted) {
							linkedQ.push(ques);
						}
					});
				});
			}

			console.log(linkedQ);
		});
	}
</script>

{#await upvotedLinks}
	<p>Login to Stack Overflow to get Linked Question Upvoted by you</p>
{:then result}
	<p>Display Linked Questions here</p>
{/await}
