"use strict";
const config = {
    secret: "cmpe273_kafka_passport_mongo",
    frontendURI: "http://localhost:3000",
    kafkaURI: "localhost:2181",
    mysqlUser: "admin",
    mysqlPassword: "adminpayal",
    mysqlHost: "database-ms1.cnqtrxygyjza.us-west-1.rds.amazonaws.com",
    mysqlDatabase: "dbReddit",
    mongoDBURI:
        "mongodb+srv://admin:admin@cluster0.57tzh.mongodb.net/reddit?retryWrites=true&w=majority",
    redisHost: "localhost",
    redisPort: 6379,
};

module.exports = config;
