const config = {
   port: process.env.PORT || 4000,
   mongoPath:"mongodb+srv://KenshinPL:na3Z8XlUVIbvXnlz@chat.jutnsuk.mongodb.net/chat"
};

module.exports = {
   config: config,
   mongoPath:config.mongoPath
}