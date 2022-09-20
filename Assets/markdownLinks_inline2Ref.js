// node Assets/markdownLinks_inline2Ref.js ReadMe.md RefLinks.md

import * as fs from 'fs'
fs.readFile(process.argv[2], 'utf8', function (err, markdown) {
    if (err) {
        return console.log(err);
    }
    var counter = 1;
    var matches = {};
    var matcher = /\[.*?\][\(\[](.*?)[\]\)]/g; // /\[.*?\]\((.*?)\)/g
    let match = true;
    while (match) {
        if (!matches[match[1]]) matches[match[1]] = counter++;
        match = matcher.exec(markdown);
    }
    console.log(matches);
    Object.keys(matches).forEach(function (url) {
        // var r = new RegExp("(\\[.*?\\])\\(" + url + "\\)", "g");
        var r = new RegExp("(\\[.*?\\])[\\(\\[]" + url + "[\\]\\)]", "g");
        markdown = markdown.replace(r, "$1[" + matches[url] + "]");
        markdown += "\n[" + matches[url] + "]: " + url;
    });

    fs.writeFile(process.argv[3], markdown, 'utf8', function (err) {
        if (err) return console.log(err);
    });

});