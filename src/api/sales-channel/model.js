import mongoose, { Schema } from 'mongoose'
import validate from 'mongoose-validator'
import { User } from '../user'

// TODO: make use of discriminator schemas (mongoose) when there
// are other SC types
export const salesChannelTypes = [
  'ecommerce'
]

const salesChannelSchema = new Schema({
  userRef: {
    type: Schema.Types.ObjectId,
    required: true,
    validate: {
      isAsync: true,
      validator (v, done) {
        User.findById(v, (err, doc) => {
          if (err) {
            done(false, `SalesChannel validation failed: ${err}`)
          }
          if (!doc) {
            done(false, 'User not found.')
            return
          }
          if (doc.role !== 'store_admin') {
            done(false, 'User can only be of role store_admin')
            return
          }
          done(true)
        })
      }
    }
  },
  domain: {
    type: String,
    unique: true,
    // TODO: domain is required until we have multiple SCtypes
    required: true,
    validate: [
      {
        validator (v) {
          if (salesChannelTypes.indexOf(v) > -1) return false
          return true
        },
        message: 'Not a valid SalesChannel'
      },
      validate({
        validator: 'isFQDN',
        message: 'Is not a FQDN'
      })
    ]
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: salesChannelTypes,
    required: true
  },
  siteData: {
    type: Schema.Types.Mixed
  },
  emailTemplates: {
    type: Schema.Types.Mixed
  },
  easyShip: {
    type: Schema.Types.Mixed
  },
  facebook: {
    type: Schema.Types.Mixed
  },
  sendGrid: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
})

salesChannelSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      userRef: this.userRef,
      domain: this.domain,
      name: this.name,
      type: this.type,
      siteData: this.siteData,
      emailTemplates: this.emailTemplates,
      easyShip: this.easyShip,
      facebook: this.facebook,
      sendGrid: this.sendGrid,
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
