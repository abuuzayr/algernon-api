import { Router } from "express";
import { middleware as body } from "bodymen";
import { create, show, update } from "./controller";
import validator from "../user/validator";

const router = Router();
const { email, password } = validator.create;

router.post("/",
  body({ email, link: { type: String, required: true } }),
  create);

router.get("/:token",
  show);

router.put("/:token",
  body({ password }),
  update);

export default router;
