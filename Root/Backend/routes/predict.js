import express from 'express';
const router = express.Router();
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

router.post("/", async (req, res) => {
  try {
    const symptoms = req.body.symptoms;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: "No symptoms provided" });
    }

    // Call external prediction API
    const apiResponse = await axios.post(process.env.PREDICTION_API, {
      symptoms: symptoms,
    });

    res.json({
      success: true,
      predictions: apiResponse.data,
    });

  } catch (err) {
    console.error("Prediction API Error:", err);
    res.status(500).json({ message: "Prediction service unavailable" });
  }
});

export default router;
