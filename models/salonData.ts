import mongoose from "mongoose";
const salonDataSchema = new mongoose.Schema({
  salonName: {
    type: String,
    required: true,
  },
  salonAddress: {
    type: String,
    required: true,
  },
  salonPhoneNumber: {
    type: [String],
    required: true,
  },
  salonLocation: {
    type: String,
    required: true,
  },
  salonDescription: {
    type: String,
  },
  salonLogo: {
    type: String,
    required: true,
  },
  salonWorkingHours: {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  salonInstagram: {
    type: String,
    required: true,
  },
  salonTelegram: {
    type: String,
  },
  salonWhatsapp: {
    type: String,
  }
}, { timestamps: true });

export default  mongoose.model("SalonData", salonDataSchema)||mongoose.models.SalonData ;
