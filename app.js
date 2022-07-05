const express = require('express');
const app = express();
const port = 3003;
const middleware = require('./middleware')
const path = require('path')
const bodyParser = require("body-parser")
const mongoose = require("./database");
const session = require("express-session");
const stripe = require("stripe")('sk_test_51LHjpdEZZiK54waal5CeD2qHjc9P5LV7sUqFgUsJ8Vi8EwSkNzGD1XQBEVPCxcKcgabBa8WxdUmWryAs6evDl0Ra00vjb96Cqe');

const server = app.listen(port, () => console.log("Server listening on port " + port));
const io = require("socket.io")(server, {pingTimeout: 60000});

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "bbq chips",
    resave: true,
    saveUninitialized: false
}))

// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout');
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const messagesRoute = require('./routes/messagesRoutes');
const notificationsRoute = require('./routes/notificationRoutes');
const Stripe = require('./routes/api/stripe');
// Api routes
const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');
const chatsApiRoute = require('./routes/api/chats');
const shopApiRoute = require('./routes/api/shop');
const messagesApiRoute = require('./routes/api/messages');
const notificationsApiRoute = require('./routes/api/notifications');
const commentsApiRoute = require('./routes/api/comments');
const creditApiRoute = require('./routes/api/credit');
const wishApiRoute = require('./routes/api/wish');


const cors = require("cors");

app.use(cors())
app.use(bodyParser.json());
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);
app.use("/uploads", uploadRoute);
app.use("/search", middleware.requireLogin, searchRoute);
app.use("/messages", middleware.requireLogin, messagesRoute);
app.use("/notifications", middleware.requireLogin, notificationsRoute);
app.use("/api/shop", middleware.requireLogin, shopApiRoute);
app.use("/api/wish", middleware.requireLogin, wishApiRoute);


app.use("/api/posts", middleware.requireLogin, postsApiRoute);
app.use("/api/users", middleware.requireLogin, usersApiRoute);
app.use("/api/credit", middleware.requireLogin, creditApiRoute);
app.use("/api/chats", middleware.requireLogin, chatsApiRoute);
app.use("/api/messages", middleware.requireLogin, messagesApiRoute);
app.use("/api/notifications", middleware.requireLogin, notificationsApiRoute);
app.use("/api/comments", middleware.requireLogin, commentsApiRoute);
app.use('/create-payment-intent', middleware.requireLogin, Stripe);





// app.use(express.static("public"));
// app.use(express.json());

// const calculateOrderAmount = (items) => {
//   return 1400;
// };

// app.post("/create-payment-intent", async (req, res) => {
//   const { items } = req.body;

//   // Create a PaymentIntent with the order amount and currency
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: calculateOrderAmount(items),
//     currency: "eur",
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });

//   res.send({
//     clientSecret: paymentIntent.client_secret,
//   });
// });



app.get("/", middleware.requireLogin, (req, res, next) => {

    const payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    };

    res.status(200).render("home", payload);
})

io.on("connection", socket => {

    socket.on("setup", userData => {
        // console.log('onsetup...', userData);
        socket.join(userData._id);
        socket.emit("connected");
    })

    socket.on("join room", room => {
        console.log('room joined: ', room);
        return socket.join(room);
    });
    socket.on("typing", room => socket.in(room).emit("typing"));
    socket.on("stop typing", room => socket.in(room).emit("stop typing"));
    socket.on("notification received", room => {
        console.log('room number chachachas: ', room);
        return socket.in(room).emit("notification received");
    });

    socket.on("new message", newMessage => {
        const chat = newMessage.chat;

        if (!chat.users) return console.log("Chat.users not defined");

        chat.users.forEach(user => {

            if (user._id === newMessage.sender._id) return;
            socket.in(user._id).emit("message received", newMessage);
        })
    });

})
