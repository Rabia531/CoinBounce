const express = require("express");
const dbConnect = require("./database/index");
const {PORT} = require("./config/index");
const router = require('./routes/index');
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");

const app = express();

// app.get("/", (req, res) =>
//     res.json({msg: "Hello World"})
// );
app.use(cookieParser());

app.use(express.json());

app.use(router);

dbConnect();

app.use(errorHandler);



app.listen(PORT, console.log(`Backend is running on port: ${PORT}`));

// app.listen(PORT, ()=> {
//     console.log(`Server is running at ${PORT}`);

// });
