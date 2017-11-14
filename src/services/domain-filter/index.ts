import config from "../../config";

export const domainFromHost = (h: string | string[]) => {
  if (Array.isArray(h)) {
    h = h[0];
  }
  if (h.indexOf(":") > 0) {
    return h.split(":")[0];
  }
  return h;
};

export const userFilter = (host: string | string[], criteria: Object) => {
  const c: any = {};

  const domain = domainFromHost(host);

  if (domain === config.manageDomain) {
    c.role = { $in: ["super_admin", "store_admin"] };
  } else {
    c.domain = domain;
    c.role = "customer";
    c.salesChannelType = "ecommerce";
  }

  return Object.assign({}, criteria, c);
};