import { Router } from "express";
import { password as passwordAuth, token } from "../../services/passport";
import { index, showMe, show, create, update, updateMe, updatePassword, destroy } from "./controller";
import { transformQuery, transformBody } from "../../services/mongoose/transform/request";

const router = Router();

router.get("/",
  token({ required: true, roles: ["super_admin"] }),
  transformQuery(),
  index);

router.get("/me",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  transformQuery(),
  showMe);

router.get("/:id",
  token({ required: true, roles: ["super_admin"] }),
  transformQuery(),
  show);

router.post("/",
  token({ required: true, roles: ["super_admin"] }),
  transformBody(),
  create);

router.put("/me",
  token({ required: true, roles: ["super_admin", "store_admin"] }),
  transformBody(),
  updateMe);

router.put("/:id",
  token({ required: true, roles: ["super_admin"] }),
  transformBody(),
  update);

router.put("/:id/password",
  passwordAuth(),
  transformBody(),
  updatePassword);

router.delete("/:id",
  token({ required: true, roles: ["super_admin"] }),
  transformBody(),
  destroy);

export default router;
