"use strict";
const app = require("./app");
const chat = require("./routes/Chat/chat");
const kafkaChat = require("./routes/Chat/kafkaChat");
const redisChat = require("./routes/Chat/redisChat");
//routes
//const login = require("./routes/login");

//app.use("/api/login", login);
app.use("/api/chat", chat);
app.use("/api/chat/kafka", kafkaChat);
app.use("/api/chat/redis", redisChat);

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;
