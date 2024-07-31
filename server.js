const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config();

const DB=process.env.MONGO_URI
mongoose.connect(DB).then(()=>{
    console.log('MongoDB connection established')
})
const port=process.env.PORT
const server=app.listen(port,()=>{
    console.log(`Server running on port ${port}`)  //Server is listening on port 3000
})
