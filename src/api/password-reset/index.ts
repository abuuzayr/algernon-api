import { Router } from "express";
import { create, show, update } from "./controller";
import { transformBody, transformQuery } from "../../services/mongoose/transform/request";
import { validateRequest } from "./validator";

const router = Router();

router.post("/",
  validateRequest("POST /"),
  transformBody(),
  create);

router.get("/:token",
  transformQuery(),
  show);

// Middleware is not created. why!
router.put("/:token",
  validateRequest("PUT /:token"),
  transformBody(),
  update);

export default router;
