import { User } from '../user'
import { SalesChannel } from '.'

let salesChannel, user

beforeEach(async () => {
  user = await User.create({
    email: 'store_admin@example.com',
    role: 'store_admin',
    password: '123456'
  })
  salesChannel = await SalesChannel.create({
    userRef: user.id,
    domain: 'test.example.com',
    name: 'test',
    type: 'ecommerce',
    siteData: 'test',
    emailTemplates: 'test',
    easyShip: 'test',
    facebook: 'test',
    sendGrid: 'test'
  })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = salesChannel.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(salesChannel.id)
    expect(view.userRef).toBe(salesChannel.userRef)
    expect(view.domain).toBe(salesChannel.domain)
    expect(view.name).toBe(salesChannel.name)
    expect(view.type).toBe(salesChannel.type)
    expect(view.siteData).toBe(salesChannel.siteData)
    expect(view.emailTemplates).toBe(salesChannel.emailTemplates)
    expect(view.easyShip).toBe(salesChannel.easyShip)
    expect(view.facebook).toBe(salesChannel.facebook)
    expect(view.sendGrid).toBe(salesChannel.sendGrid)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = salesChannel.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(salesChannel.id)
    expect(view.userRef).toBe(salesChannel.userRef)
    expect(view.domain).toBe(salesChannel.domain)
    expect(view.name).toBe(salesChannel.name)
    expect(view.type).toBe(salesChannel.type)
    expect(view.siteData).toBe(salesChannel.siteData)
    expect(view.emailTemplates).toBe(salesChannel.emailTemplates)
    expect(view.easyShip).toBe(salesChannel.easyShip)
    expect(view.facebook).toBe(salesChannel.facebook)
    expect(view.sendGrid).toBe(salesChannel.sendGrid)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
