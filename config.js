const config = {
   port: process.env.PORT || 4000,
   mongoPath:"secret"
};

module.exports = {
   config: config,
   mongoPath:config.mongoPath
}
