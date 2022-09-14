<script>
	import browser from "webextension-polyfill";
	import StackContent from "./StackContent.svelte";

	import Api from "~/utils/stackAPI";
	import { QuesIdUrl } from "~/utils/utils";

	let glCurrTab;
	const apiData = {
		token: "",
		userName: "",
	};
	const upvotedLinks = GetUpvotedLinks();

	async function GetUpvotedLinks() {
		let linkedQ = [];
		await browser.storage.sync.get({ apiData: apiData }).then(async function (result) {
			const token = result.apiData.token;

			if (token != "") {
				await browser.tabs.query({ active: true, lastFocusedWindow: true }).then(async function (tabs) {
					glCurrTab = tabs[0];
					const quesId = QuesIdUrl(glCurrTab.url);

					const stackApi = new Api(token);
					const allLinkedQs = await stackApi.getLinkedQues(quesId);
					console.log(allLinkedQs);

					allLinkedQs.forEach((ques) => {
						if (ques.upvoted) {
							linkedQ.push(ques.question_id.toString());
						}
					});
				});
			}

			console.log(linkedQ);
		});
		return linkedQ;
	}
</script>

{#await upvotedLinks}
	<p>Login to Stack Overflow to get Linked Question Upvoted by you</p>
{:then linkqIds}
	<StackContent eleList={linkqIds} type="linkq" tab={glCurrTab} />
{/await}
