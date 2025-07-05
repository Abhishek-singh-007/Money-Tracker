import { Router } from "express";
import transactions from "./transaction.routes.js";
import usersRoutes from "./user.routes.js";

const router = Router();

router.use("/transactions", transactions);
router.use("/users", usersRoutes);

export default router;