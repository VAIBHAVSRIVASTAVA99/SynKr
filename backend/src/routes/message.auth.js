import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUserForSidebar, sendMessage, getGroupMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUserForSidebar);
router.get("/:id", protectRoute, getMessages);
router.get("/group/:groupId", protectRoute, getGroupMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;