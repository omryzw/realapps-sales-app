let NodeCache = require("node-cache");
let myCache = new NodeCache({
    stdTTL: 500000,
    checkperiod: 0,
});


const setUserStage = async (senderPhone, stage) => {
    return await myCache.set(senderPhone, stage);
};

const getUserStage = async (senderPhone) => {
    let stage = await myCache.get(senderPhone)
    return stage;
};

module.exports = {
    setUserStage,
    getUserStage,
};