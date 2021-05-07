"use strict";
const { sendMessage } = require("./sendMessage");
const { getChat } = require("./getChat");

let handle_request = (msg, callback) => {
    switch (msg.route) {
        case "send_message":
            sendMessage(msg, callback);
            break;
        case "get_chat":
            getChat(msg, callback);
            break;
    }
};

exports.handle_request = handle_request;
