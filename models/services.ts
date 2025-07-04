import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  category: {
    type:mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  available: {
    type: Boolean,
    default: true,}
});
export default mongoose.models.Service || mongoose.model("Service", serviceSchema);