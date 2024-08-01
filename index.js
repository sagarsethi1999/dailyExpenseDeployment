
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./models/user");
const Expense = require('./models/expense');
const Order = require('./models/order');
const ForgotPasswordRequest = require('./models/ForgotPasswordRequest');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');

const mongoose = require('mongoose');


const app = express();
const helmet = require('helmet');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });


app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app. use( helmet({ contentSecurityPolicy: false, }) ); 
app.use(compression());





const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

const expenseRoutes = require("./routes/expenseRoutes");
app.use("/user/expense", expenseRoutes);

const purchase = require("./routes/purchase");
app.use("/purchase/premiummembership", purchase);

const premium = require("./routes/premium");
app.use("/", premium);

const password = require("./routes/password");
app.use("/password", password);

app.use((req, res) => {
  res.sendFile(path.join(__dirname,`public/${req.url}`))
})



mongoose
.connect('mongodb+srv://sagars:sagarhero143@sagars.gpcupps.mongodb.net/expense_tracker?retryWrites=true&w=majority&appName=sagars')
.then(result => {
    app.listen(3000);
    console.log('data base is connected!!!')
})
.catch(err => {
    console.log(err);
});