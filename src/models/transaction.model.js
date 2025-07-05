import mongoose, { Schema } from "mongoose"

const transactionSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, required: false },
        amount: { type: Number, required: false },
        description: { type: String, required: false },
        date: { type: String, required: false },
    },
    { timestamps: true }
)

export const Transaction = mongoose.model("Transaction", transactionSchema);