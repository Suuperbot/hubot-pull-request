// Description:
// Let's get some github pull request info
//
// Commands:
//   listens for github.com pull request urls like https://github.com/kitcheck/kitcheck-ui/pull/975

'use strict';
var _ = require('lodash');

function formatPr(pr) {
    return pr.title + ' #' + pr.number + '\n[' + pr.state.charAt(0).toUpperCase() + pr.state.slice(1) + '] ' + pr.user.login + ' wants to merge ' + pr.commits + ' commit into \`' + pr.base.ref + '\` from \`' + pr.head.ref + '\`';
}

module.exports = function(robot) {
    var regex = /https\:\/\/(?:www\.)?github\.com\/kitcheck\/(([A-Za-z\-])+)\/pull\/([\d]+)/gi;
    robot.hear(regex, function(msg) {
        var matches = regex.exec(msg.message.text);
        var project = matches[1];
        var pull = matches[3];
        var apiUrl = 'https://api.github.com/repos/kitcheck/' + project + '/pulls/' + pull;
        var apiToken = process.env.HUBOT_GITHUB_API_TOKEN;
        msg.http(apiUrl).header('Authorization', 'token ' + apiToken).get()(function(err, res, body) {
            if (err) {
                return;
            }
            try {
                var pr = JSON.parse(body);
                msg.send(formatPr(pr));
            } catch (e) {
                return;
            }
        });
    });
};
