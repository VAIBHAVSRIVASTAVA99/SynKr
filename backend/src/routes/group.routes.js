import express from "express";
import {
  createGroup,
  getGroups,
  addMember,
  removeMember,
  deleteGroup,
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute); 

router.post("/", createGroup);
router.get("/", getGroups);
router.post("/:groupId/members", addMember);
router.delete("/:groupId/members", removeMember);
router.delete("/:groupId", deleteGroup);

export default router; 