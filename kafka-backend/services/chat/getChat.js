"use strict";
const Chat = require("../../models/chatModel");
const { STATUS_CODE, MESSAGES } = require("../../utils/constants");
const mongoose = require("mongoose");
const redisClient = require("../../utils/redisConfig");

let getChat = async (msg, callback) => {
    let response = {};
    let err = {};
    const chat_id = "chat";
    try {
        redisClient.get(chat_id, async (err, chat) => {
            if (chat) {
                response.status = STATUS_CODE.SUCCESS;
                response.data = JSON.parse(chat);
                return callback(null, response);
            } else {
                let userChats = await Chat.find({}, { sender: 1 });
                // findById(
                //     mongoose.Types.ObjectId(msg.chat_id)
                // )
                //     .populate({
                //         path: "user1",
                //         model: "user",
                //         match: {
                //             _id: { $ne: mongoose.Types.ObjectId(msg.user_id) },
                //         },
                //         select: "userName",
                //     })
                //     .populate({
                //         path: "user2",
                //         model: "user",
                //         match: {
                //             _id: { $ne: mongoose.Types.ObjectId(msg.user_id) },
                //         },
                //         select: "userName",
                //     })
                //     .populate({
                //         path: "message.sender",
                //         model: "user",
                //         select: "userName",
                //     });

                redisClient.setex(chat_id, 3600, JSON.stringify(userChats));
                response.status = STATUS_CODE.SUCCESS;
                response.data = JSON.stringify(userChats);
                return callback(null, response);
            }
        });
    } catch (error) {
        console.log(error);
        err.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
        err.data = MESSAGES.INTERNAL_SERVER_ERROR;
        return callback(err, null);
    }
};

exports.getChat = getChat;
