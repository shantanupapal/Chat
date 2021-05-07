"use strict";
const User = require("../../models/userModel");
const Chat = require("../../models/chatModel");
const { STATUS_CODE, MESSAGES } = require("../../utils/constants");
const mongoose = require("mongoose");
const redisClient = require("../../utils/redisConfig");

let sendMessage = async (msg, callback) => {
    console.log("inside kafka sendmessage");
    let response = {};
    let err = {};
    try {
        let newMessage = {
            sender: mongoose.Types.ObjectId(msg.sender),
            msgContent: "Using kafka: " + msg.message_content,
            msgTime: new Date(),
        };

        if (msg.chat_id) {
            let existingChat = await Chat.findById(
                mongoose.Types.ObjectId(msg.chat_id)
            );
            if (!existingChat) {
                err.status = STATUS_CODE.BAD_REQUEST;
                err.data = MESSAGES.DATA_NOT_FOUND;
                return callback(err, null);
            }

            existingChat.message.push(newMessage);
            let chatUpdate = await existingChat.save({ new: true });

            if (chatUpdate) {
                redisClient.setex(
                    msg.chat_id,
                    3600,
                    JSON.stringify(chatUpdate)
                );
                response.status = STATUS_CODE.CREATED_SUCCESSFULLY;
                response.data = chatUpdate;
                return callback(null, response);
            } else {
                err.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
                err.data = MESSAGES.ACTION_NOT_COMPLETE;
                return callback(err, null);
            }
        } else {
            console.log("New chat");
            let user1 = User.findById(mongoose.Types.ObjectId(msg.sender));
            let user2 = User.findById(mongoose.Types.ObjectId(msg.receiver));

            if (!user1 || !user2) {
                err.status = STATUS_CODE.BAD_REQUEST;
                err.data = MESSAGES.INVALID_INPUTS;
                return callback(err, null);
            }

            let newChat = new Chat({
                user1: msg.sender_id,
                user2: msg.receiver_id,
                message: newMessage,
            });

            const chatSave = await newChat.save({ new: true });

            if (chatSave) {
                redisClient.setex(msg.chat_id, 3600, JSON.stringify(chatSave));
                response.status = STATUS_CODE.CREATED_SUCCESSFULLY;
                response.data = chatSave;
                return callback(null, response);
            } else {
                err.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
                err.data = MESSAGES.INTERNAL_SERVER_ERROR;
                return callback(err, null);
            }
        }
    } catch (error) {
        console.log(error);
        err.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
        err.data = MESSAGES.INTERNAL_SERVER_ERROR;
        return callback(err, null);
    }
};

exports.sendMessage = sendMessage;
