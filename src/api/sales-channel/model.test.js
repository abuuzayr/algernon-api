import { SalesChannel } from '.'

let salesChannel

// TODO: Test for proper site data and other fields.
beforeEach(async () => {
  salesChannel = await SalesChannel.create({
    name: 'test',
    type: 'ecommerce',
    sub_domain: 'test',
    facebook: {},
    paypal: {},
    easy_ship: {},
    google_analytics: {},
    email_service: {},
    site_data: {},
    email_templates: {} })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = salesChannel.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(salesChannel.id)
    expect(view.name).toBe(salesChannel.name)
    expect(view.type).toBe(salesChannel.type)
    expect(view.sub_domain).toBe(salesChannel.sub_domain)
    expect(view.facebook).toBe(salesChannel.facebook)
    expect(view.paypal).toBe(salesChannel.paypal)
    expect(view.easy_ship).toBe(salesChannel.easy_ship)
    expect(view.google_analytics).toBe(salesChannel.google_analytics)
    expect(view.email_service).toBe(salesChannel.email_service)
    expect(view.site_data).toBe(salesChannel.site_data)
    expect(view.email_templates).toBe(salesChannel.email_templates)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = salesChannel.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(salesChannel.id)
    expect(view.name).toBe(salesChannel.name)
    expect(view.type).toBe(salesChannel.type)
    expect(view.sub_domain).toBe(salesChannel.sub_domain)
    expect(view.facebook).toBe(salesChannel.facebook)
    expect(view.paypal).toBe(salesChannel.paypal)
    expect(view.easy_ship).toBe(salesChannel.easy_ship)
    expect(view.google_analytics).toBe(salesChannel.google_analytics)
    expect(view.email_service).toBe(salesChannel.email_service)
    expect(view.site_data).toBe(salesChannel.site_data)
    expect(view.email_templates).toBe(salesChannel.email_templates)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
