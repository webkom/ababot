const mqtt = require('mqtt');

const { MQTT_USER, MQTT_PASS } = process.env;

function mqttClient() {
  return mqtt.connect('mqtt://mqtt.abakus.no', {
    username: MQTT_USER,
    password: MQTT_PASS
  });
}

module.exports = mqttClient;
