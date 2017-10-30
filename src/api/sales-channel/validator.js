import { salesChannelTypes } from './model'

export default {
  validSalesChannelType: {
    validator (v) {
      if (salesChannelTypes.indexOf(v) > -1) return false
      return true
    },
    message: 'Not a valid SalesChannel'
  }
}
