//  you can use `npx remark README.md -o --use reference-links` instead of this file
// npx remark README.md -o --use reference-links

// reference: https://stackoverflow.com/a/73790035/6908282
// node Assets/markdownLinks_inline2Ref.js ReadMe.md RefLinks.md

import * as fs from 'fs'
fs.readFile(process.argv[2], 'utf8', function (err, mainMarkdown) {
    if (err) {
        return console.log(err);
    }
    let newMarkdown = existingRefLinks(mainMarkdown);

    var counter = 1;
    var matches = {};
    var matcher = /\[.*?\]\((.*?)\)/g
    let match;
    while (match = matcher.exec(newMarkdown)) {
        if (!matches[match[1]]) matches[match[1]] = counter++;
    }
    console.log(matches);
    Object.keys(matches).forEach(function (url) {
        var r = new RegExp("(\\[.*?\\])\\(" + url + "\\)", "g");
        newMarkdown = newMarkdown.replace(r, "$1[" + matches[url] + "]");
        newMarkdown += "\n[" + matches[url] + "]: " + url;
    });

    fs.writeFile(process.argv[3], newMarkdown, 'utf8', function (err) {
        if (err) return console.log(err);
    });

});

function existingRefLinks(markdown) {
    let refLinks = {}, match;
    const matcher = /\[(\d)]:\s(.*)/g; // /\[.*?\]\((.*?)\)/g
    while (match = matcher.exec(markdown)) {
        if (!refLinks[match[1]]) refLinks[match[1]] = match[2];
    }
    markdown = markdown.replaceAll(matcher, "")

    Object.keys(refLinks).forEach(function (int) {
        markdown = markdown.replace("][" + int + "]", "](" + refLinks[int] + ")");
    });
    return markdown
}