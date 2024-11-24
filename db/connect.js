const mongoose = require("mongoose");

const connectDatabase = async (url) => {
  await mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Mongodb connected with server`);
    })
    .catch((err)=>{
        console.log(err);
    })
};

module.exports = connectDatabase;