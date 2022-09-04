# StackMeFirst

This is a browser Extension (currently only available in Microsoft Edge & Firefox) that - Highlights and sorts any answers posted by current user in Stack overflow to the top of the list of answers.

All of the current user's answers will be highlighted with a green border and listed at the top of all answer's.

## Screenshots

![Screenshot 1](./Assets/Screenshots/Screenshot%201.png)
![Screenshot 2](./Assets/Screenshots/Screenshot%202.png)
![Screenshot 3](./Assets/Screenshots/Screenshot%203.png)

# Contribution

Checkout the contribution instructions in the [following file](./Contribution.md)

---

# StackMeFirst-Svelte.js

The code in this [./src](./src) uses [@samrum/vite-plugin-web-extension][1] npm package to build browser extension for Manifest V2 & V3 using Svelte + Vite.

## Chrome:

[Manifest version 2 is no longer being maintained][2]

> As of January 17, 2022 Chrome Web Store has stopped accepting new Manifest V2 extensions. We strongly recommend that new extensions target Manifest V3.

[Manifest V3 migration checklist][4]

## Edge:

[Overview and timelines for migrating to Manifest V3][5]

## FireFox:

[Manifest V3 migration guide][6]
[Manifest v3 in Firefox: Recap & Next Steps][7]

[1]: https://github.com/samrum/vite-plugin-web-extension
[2]: https://developer.chrome.com/docs/extensions/mv2/
[4]: https://developer.chrome.com/docs/extensions/mv3/mv3-migration-checklist/
[5]: https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/manifest-v3
[6]: https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/
[7]: https://blog.mozilla.org/addons/2022/05/18/manifest-v3-in-firefox-recap-next-steps/
