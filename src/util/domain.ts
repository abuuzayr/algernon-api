export const domainFromHost = (h: string | string[]) => {
  if (Array.isArray(h)) {
    h = h[0];
  }
  if (h.indexOf(":") > 0) {
    return h.split(":")[0];
  }
  return h;
};