import { Router } from "express";
import { token } from "../../services/passport";
import { create, index, show, update, destroy } from "./controller";
import { transformQuery, transformBody } from "../../services/mongoose/transform/request";

const router = Router();

router.post("/",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  transformBody(),
  create);

router.get("/",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  transformQuery(),
  index);

router.get("/:id",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  transformQuery(),
  show);

router.put("/:id",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  transformBody(),
  update);

router.delete("/:id",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  transformBody(),
  destroy);

export default router;
