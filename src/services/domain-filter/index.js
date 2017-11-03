import { manageDomain } from '../../config'

export const domainFromHost = (host) => {
  if (host.indexOf(':') > 0) {
    return host.split(':')[0]
  }
  return host
}

export const userFilter = (host, criteria) => {
  let c = {}
  const domain = domainFromHost(host)

  if (domain === manageDomain) {
    c.role = { $in: ['super_admin', 'store_admin'] }
  } else {
    c.domain = domain
    c.role = 'customer'
    c.salesChannelType = 'ecommerce'
  }

  return Object.assign({}, criteria, c)
}
