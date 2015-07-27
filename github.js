// Description:
// Let's get some github pull request info
//
// Commands:
//   listens for github.com pull request urls like https://github.com/kitcheck/kitcheck-ui/pull/975

'use strict';
var _ = require('lodash');

function formatPr(pr, issue) {
    var message = pr.title +
        ' #' + pr.number + '\n`[' +
        pr.state.charAt(0).toUpperCase() +
        pr.state.slice(1) + ']` ' + pr.user.login +
        ' wants to merge ' + pr.commits + ' commit' +
        (pr.commits !== 1 ? 's' : '') + ' into \`' +
        pr.base.ref + '\` from \`' + pr.head.ref + '\`';

    if (issue.labels.length) {
        message += '\n';
        _.each(issue.labels, function(label) {
            message += '`[' + label.name + ']`';
        });
    }
    return message;
}

module.exports = function(robot) {
    robot.hear(/https\:\/\/(?:www\.)?github\.com\/kitcheck\/(([A-Za-z\-])+)\/pull\/([\d]+)/gi, function(msg) {
        var urls = msg.message.text.match(/https\:\/\/(?:www\.)?github\.com\/kitcheck\/(([A-Za-z\-])+)\/pull\/([\d]+)/gi);
        _.each(urls, function(url) {
            var matches = /https\:\/\/(?:www\.)?github\.com\/kitcheck\/(([A-Za-z\-])+)\/pull\/([\d]+)/gi.exec(url);
            var project = matches[1];
            var pull = matches[3];
            var baseUrl = 'https://api.github.com/repos/kitcheck/';
            var pullRequestUrl = baseUrl + project + '/pulls/' + pull;
            var apiToken = process.env.HUBOT_GITHUB_API_TOKEN;
            msg.http(pullRequestUrl).header('Authorization', 'token ' + apiToken).get()(function(err, res, body) {
                if (err) {
                    return;
                }
                try {
                    var pr = JSON.parse(body);
                    var issueUrl = baseUrl + project + '/issues/' + pull;
                    msg.http(issueUrl).header('Authorization', 'token ' + apiToken).get()(function(err, res, body) {
                        if (err) {
                            return;
                        }
                        try {
                            var issue = JSON.parse(body);
                            msg.send(formatPr(pr, issue));
                        } catch (e) {
                            return;
                        }
                    });
                } catch (e) {
                    return;
                }
            });
        });
    });
};
