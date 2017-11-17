import { Router } from "express";
import { middleware as query } from "querymen";
import { middleware as body } from "bodymen";
import { password as passwordAuth, token } from "../../services/passport";
import { index, showMe, show, create, update, updateMe, updatePassword, destroy } from "./controller";
import v from "./validator";

const router = Router();

router.get("/",
  token({ required: true, roles: ["super_admin"] }),
  query(),
  index);

router.get("/me",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  showMe);

router.get("/:id",
  token({ required: true, roles: ["super_admin"] }),
  show);

router.post("/",
  token({ required: true, roles: ["super_admin"] }),
  body(v.create),
  create);

router.put("/me",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  body(v.updateMe),
  updateMe);

router.put("/:id",
  token({ required: true, roles: ["super_admin"] }),
  body(v.update),
  update);

router.put("/:id/password",
  passwordAuth(),
  body(v.updatePassword),
  updatePassword);

router.delete("/:id",
  token({ required: true, roles: ["super_admin"] }),
  destroy);

export default router;
