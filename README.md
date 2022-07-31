# StackMeFirst

This is a browser Extension (currently only available in Microsoft Edge & Firefox) that - Highlights and sorts any answers posted by current user in Stack overflow to the top of the list of answers.

All of the current users answers will be highlighted with a green border and listed at the top of all answer's.

<details>
    <summary>personal note: steps to update Edge extension version</summary>

In order to update the version - you need tot zip all the relevant files ([manifest.json](manifest.json), [contentScript.js](contentScript.js), [background.js](background.js), [./icons](./icons) ) that represents your extension package and Upload the extension package in [Microsoft Partner Center][1].

use below script to create zip from terminal:
Note: below scripts won't work if you have the plugin loaded in browser

[Powershell script][3]:

```powershell
Compress-Archive -Force -Path manifest.json, background.js, contentScript.js, Icons -CompressionLevel Optimal -DestinationPath StackMeFirst.Zip
```

[using tar.exe in Command Prompt][2]:

```bash
tar -acf StackMeFirst.zip -c manifest.json background.js contentScript.js Icons
```

</details>

## Screenshots

![Screenshot 1](./Assets/Screenshots/Screenshot%201.png)
![Screenshot 2](./Assets/Screenshots/Screenshot%202.png)
![Screenshot 3](./Assets/Screenshots/Screenshot%203.png)

[1]: https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview
[2]: https://stackoverflow.com/a/68728992/6908282
[3]: https://stackoverflow.com/a/55173830/6908282
