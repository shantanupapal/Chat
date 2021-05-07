"use strict";
const express = require("express");
const router = express.Router();
// const kafka = require("../../kafka/client");
const { STATUS_CODE } = require("../../utils/constants");

router.post("/sendmessage", async (req, res) => {
    console.log("inside post send message: kafka");
    let msg = req.body;
    msg.route = "send_message";

    kafka.make_request("chat", msg, function (err, results) {
        if (err) {
            return res.status(err.status).send(err.data);
        } else {
            return res.status(results.status).send(results.data);
        }
    });
});

router.get("/getchat", async (req, res) => {
    console.log("inside get_chat: kafka");
    let msg = {};
    msg.route = "get_chat";
    msg.chat_id = req.params.chat_id;
    msg.user_id = req.params.user_id;
    kafka.make_request("chat", msg, function (err, results) {
        if (err) {
            res.status(err.status).send(err.data);
        } else {
            res.status(results.status).send(results.data);
        }
    });
});

module.exports = router;
