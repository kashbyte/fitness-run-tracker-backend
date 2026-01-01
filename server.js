import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import runRoutes from "./routes/runRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/runs", runRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => {
      console.log("Backend running on http://localhost:5000");
    });
  })
  .catch((err) => console.error(err));
