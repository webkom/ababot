const _ = require('lodash');
const members = require('../lib/members');
const get_presence_device = require('../lib/presence');

const createMention = username => `@${username}`;

module.exports = robot => {
  robot.hear(/@kontoret|@office/i, msg => {
    members()
      .then(members => {
        Promise.all(
          members.map(member =>
            Promise.all(
              member.wifi_devices.map(device_mac =>
                get_presence_device(device_mac).then(presence_device => {
                  if (
                    presence_device === undefined ||
                    Math.abs(
                      (new Date().getTime() -
                        presence_device.info.last_seen.toDate().getTime()) /
                        1000
                    ) >
                      60 * 15
                  ) {
                    return false;
                  }
                  return member.slack;
                })
              )
            )
          )
        ).then(members_queried => {
          const membersAtOffice = _.uniq(
            members_queried
              .reduce((a, b) => a.concat(b))
              .filter(member_device => member_device !== false)
          );
          if (membersAtOffice.length === 0) {
            msg.send(
              'Nobody at the office at the moment :slightly_frowning_face:'
            );
            return;
          }

          msg.send(
            membersAtOffice.map(member => createMention(member)).join(', ')
          );
        });
      })
      .catch(error => msg.send(error.message));
  });
};
