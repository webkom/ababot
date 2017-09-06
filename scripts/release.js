const HubotCron = require('hubot-cronjob');
const GitHubApi = require("github");
const Promise = require("bluebird");
const moment = require("moment");

const github = new GitHubApi({ Promise });

github.authenticate({
    type: "token",
    token: process.env.GITHUB_TOKEN
});

module.exports = (robot) => {
  const pattern = '0 0 11 * * *';
  const timezone = 'Europe/Oslo'

  const countdown = function () {
    Promise.props({
      legoRelease: github.projects.getProjectCards({ column_id: '1014708' })
        .then(({ data }) => data.length),
      legoInProgress: github.projects.getProjectCards({ column_id: '1014709' })
        .then(({ data }) => data.length),
      webRelease: github.projects.getProjectCards({ column_id: '1014744' })
        .then(({ data }) => data.length),
      webInProgress: github.projects.getProjectCards({ column_id: '1014745' })
        .then(({ data }) => data.length),
    })
    .then((data) => {
      robot.messageRoom('general', {
        "attachments": [
            {
                "fallback": "Required plain-text summary of the attachment.",
                "color": "#36a64f",
                "title": "Lego Release Countdown!",
                "text": `${moment('1/10/2017', 'DD/MM/YYYY').diff(moment(), 'days')} dager til release!!`,
                "fields": [
                    {
                        "title": "lego release",
                        "value": `${data.legoRelease} issues`,
                        "short": true
                    },
                    {
                        "title": "lego in progress",
                        "value": `${data.legoInProgress} issues`,
                        "short": true
                    },
                    {
                        "title": "lego-webapp release",
                        "value": `${data.webRelease} issues`,
                        "short": true
                    },
                    {
                        "title": "lego-webapp in progress",
                        "value": `${data.webInProgress} issues`,
                        "short": true
                    }
                ],
                "footer": "work work",
                "footer_icon": "http://www.clker.com/cliparts/1/0/9/e/1487324295866254597fire-vector-icon-png-27.hi.png"
            }
        ]
      })
    });
  }

  new HubotCron(pattern, timezone, countdown);
};
