import mongoose from 'mongoose';

const TestResultSchema = new mongoose.Schema({
  testType: { type: String, required: true }, // 'alzheimer', 'tumor', 'parkinsons', etc.
  result: { type: String, required: true },
  confidence: { type: Number },
  severity: { type: String }, // 'Low', 'Moderate', 'High'
  date: { type: Date, default: Date.now },
  details: { type: mongoose.Schema.Types.Mixed }
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    default: null,
  },

  // Personal Info
  gender: { type: String, default: 'Not specified' },
  bloodGroup: { type: String, default: 'Unknown' },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  roll: { type: String },
  department: { type: String },
  emergency: { type: String },
  avatar: { type: String, default: 'https://randomuser.me/api/portraits/lego/1.jpg' },

  // Vitals
  vitals: {
    hr: { type: Number, default: 75 },
    spo2: { type: Number, default: 98 },
    temp: { type: Number, default: 98.6 }
  },

  // Medical History
  conditions: [{
    label: String,
    severity: String // 'Mild', 'Moderate', 'Severe'
  }],
  medicalHistory: [String],
  medications: [{
    name: String,
    note: String
  }],

  // Test Results
  testResults: [TestResultSchema],

  // Timeline data (last 10 readings)
  timeline: {
    hr: [Number],
    spo2: [Number],
    sleep: [Number],
    allergy: [Number]
  },

  // Last Scan
  lastScan: {
    name: String,
    status: String,
    date: Date
  },

  // Doctor
  doctor: {
    name: String
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.model("User", UserSchema);
export default User;
