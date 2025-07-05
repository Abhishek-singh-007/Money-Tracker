import { Router } from "express";
import { createTransaction, deleteTransaction, getAllTransactions, getAnalytics, updateTransaction } from "../controllers/transaction.controller.js";
import authenticateUser from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticateUser, getAllTransactions);
router.post("/", authenticateUser, createTransaction);
router.put("/:_id", authenticateUser, updateTransaction);
router.delete("/:_id", authenticateUser, deleteTransaction);
router.get("/list", authenticateUser, getAnalytics);

export default router;