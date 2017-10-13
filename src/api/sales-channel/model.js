import mongoose, { Schema } from 'mongoose'
import validator from 'mongoose-validator'

const salesChannelSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    match: /^(ecommerce|pos|marketplace)$/,
    required: true
  },
  sub_domain: {
    type: String,
    match: /^[a-z][a-zA-Z0-9-]+$/,
    required: true
  },
  facebook: {
    // TODO: facebook: confirm schema type
    type: Schema.Types.Mixed
  },
  paypal: {
    // TODO: paypal: confirm schema type
    type: Schema.Types.Mixed
  },
  easy_ship: {
    // TODO: easy_ship: confirm schema type
    type: Schema.Types.Mixed
  },
  google_analytics: {
    // TODO: google_analytics: confirm schema type
    type: Schema.Types.Mixed
  },
  email_service: {
    // TODO: email_service: confirm schema type
    type: Schema.Types.Mixed
  },
  site_data: {
    logo: {
      type: String,
      validate: validator({
        validator: 'isURL',
        protocols: ['http', 'https'],
        require_protocol: true
      })
    },
    tax_rate: Number,
    company: {
      name: String,
      address: {
        street1: String,
        street2: String,
        city: String,
        state: String,
        zip: String,
        country: String
      },
      email: String,
      phone: String,
      registration_number: String
    }
  },
  email_templates: {
    // TODO: email_templates.template: confirm schema type
    name: String,
    template: Schema.Types.Mixed
  }
}, {
  timestamps: true
})

salesChannelSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      name: this.name,
      type: this.type,
      sub_domain: this.sub_domain,
      facebook: this.facebook,
      paypal: this.paypal,
      easy_ship: this.easy_ship,
      google_analytics: this.google_analytics,
      email_service: this.email_service,
      site_data: this.site_data,
      email_templates: this.email_templates,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('SalesChannel', salesChannelSchema)

export const schema = model.schema
export default model
