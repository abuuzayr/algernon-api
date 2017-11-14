import { Router } from "express";
import { middleware as query } from "querymen";
import { middleware as body } from "bodymen";
import { token } from "../../services/passport";
import { create, index, show, update, destroy } from "./controller";
import v from "./validator";

const router = Router();

router.post("/",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  body(v.create),
  create);

router.get("/",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  query(),
  index);

router.get("/:id",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  show);

router.put("/:id",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  body(v.update),
  update);

router.delete("/:id",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  destroy);

export default router;
