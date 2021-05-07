"use strict";
const express = require("express");
const router = express.Router();
// const kafka = require("../../kafka/client");
const { STATUS_CODE, MESSAGES } = require("../../utils/constants");
const User = require("../../models/userModel");
const Chat = require("../../models/chatModel");
const mongoose = require("mongoose");
// const redisClient = require("../../utils/redisConfig");

router.post("/sendmessage", async (req, res) => {
    let msg = req.body;
    let response = {};
    let err = {};

    try {
        let newMessage = {
            sender: mongoose.Types.ObjectId(msg.sender),
            msgContent: msg.message_content,
            msgTime: new Date(),
        };

        if (msg.chat_id) {
            let existingChat = await Chat.findById(
                mongoose.Types.ObjectId(msg.chat_id)
            );
            if (!existingChat) {
                err.status = STATUS_CODE.BAD_REQUEST;
                err.data = MESSAGES.DATA_NOT_FOUND;
                return res.status(err.status).send(err.data);
            }
            console.log("Chat found");
            console.log("messgage chat existing", newMessage);
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
                return res.status(response.status).send(response.data);
            } else {
                err.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
                err.data = MESSAGES.ACTION_NOT_COMPLETE;
                return res.status(err.status).send(err.data);
            }
        } else {
            console.log("New chat");
            let user1 = User.findById(mongoose.Types.ObjectId(msg.sender));
            let user2 = User.findById(mongoose.Types.ObjectId(msg.receiver));

            if (!user1 || !user2) {
                err.status = STATUS_CODE.BAD_REQUEST;
                err.data = MESSAGES.INVALID_INPUTS;
                return res.status(err.status).send(err.data);
            }

            let newChat = new Chat({
                user1: msg.sender,
                user2: msg.receiver,
                message: newMessage,
            });
            console.log("messgage new chat", newMessage);

            const chatSave = await newChat.save({ new: true });

            if (chatSave) {
                redisClient.setex(msg.chat_id, 3600, JSON.stringify(chatSave));
                response.status = STATUS_CODE.CREATED_SUCCESSFULLY;
                response.data = chatSave;

                return res.status(response.status).send(response.data);
            } else {
                err.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
                err.data = MESSAGES.INTERNAL_SERVER_ERROR;

                return res.status(err.status).send(err.data);
            }
        }
    } catch (error) {
        console.log(error);
        err.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
        err.data = MESSAGES.INTERNAL_SERVER_ERROR;
        return res.status(err.status).send(err.data);
    }
});

router.get("/getchat", async (req, res) => {
    let response = {};
    let err = {};
    const chat_id = "chat";
    // console.log(chat_id);
    // const user_id = req.params.user_id;
    // console.log(user_id);
    try {
        redisClient.get(chat_id, async (err, chat) => {
            if (chat) {
                response.status = STATUS_CODE.SUCCESS;
                response.data = JSON.parse(chat);
                return res.status(response.status).send(response.data);
            } else {
                let userChats = await Chat.find({}, { sender: 1 });
                // .findById(
                //     mongoose.Types.ObjectId(chat_id)
                // )
                //     .populate({
                //         path: "user1",
                //         model: "user",
                //         match: {
                //             _id: { $ne: mongoose.Types.ObjectId(user_id) },
                //         },
                //         select: "userName",
                //     })
                //     .populate({
                //         path: "user2",
                //         model: "user",
                //         match: {
                //             _id: { $ne: mongoose.Types.ObjectId(user_id) },
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
                return res.status(response.status).send(response.data);
            }
        });
    } catch (error) {
        console.log(error);
        err.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
        err.data = MESSAGES.INTERNAL_SERVER_ERROR;
        return res.status(err.status).send(err.data);
    }
});

module.exports = router;
