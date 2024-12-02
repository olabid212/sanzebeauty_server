const express = require("express");
const cors = require("cors");
const app = express();

const connectDB = require("./config/db")
connectDB();

const PORT = process.env.PORT || 9000;

const userRoute = require("./routes/userRoute");
const serviceRoute = require("./routes/serviceRoute");
const appointmentRoute = require("./routes/appointmentRoute");
const categoryRoute = require('./routes/categoryRoute');
const productRoute = require('./routes/productRoute');
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const reviewRoute = require("./routes/reviewRoute");
const couponRoute = require("./routes/couponRoute");
const messageRoute = require("./routes/messageRoute");


const { notFound, errorHandler } = require("./middleware/error");

// Use CORS middleware
const corsOptions = {
  origin: "http://localhost:5173, https://sanze-beauty-z9uh.vercel.app/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204, // For legacy browser support
};

app.use(cors(corsOptions));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Define routes
app.use("/api/users", userRoute);
app.use("/api/services", serviceRoute);
app.use("/api/appointments", appointmentRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/reviews", reviewRoute)
app.use("/api/coupon", couponRoute)
app.use("/api/messages", messageRoute)

app.get("/api", (req, res) => {
    res.json({ message: "Welcome to the SANZE API" });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
