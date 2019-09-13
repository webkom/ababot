const mqtt = require('mqtt');

const { MQTT_USER, MQTT_PASS } = process.env;

function mqttPublish(topic, payload) {
  const client = mqtt.connect('mqtt://mqtt.abakus.no', {
    username: MQTT_USER,
    password: MQTT_PASS
  });
  client.publish(topic, JSON.stringify(payload));
}

module.exports = mqttPublish;
