require("dotenv").config();
const mongoose = require("mongoose");

exports.dbConnect = () => {
    console.warn("Connecting to database...",process.env.DATABASE_URL);
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DATABASE_URL, {

    });

    global.db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    db.once("open", () => {
        console.info(
            "Successfully Connected to database ✨✨ : ",
            process.env.DATABASE_URL
        );
    });
};

exports.dbClose = async () => {
    try {
        await db.close();
    } catch (e) {
        console.error(e);
    }
};