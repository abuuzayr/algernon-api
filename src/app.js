import http from 'http'
import { env, mongo, port, ip } from './config'
import mongoose from './services/mongoose'
import express from './services/express'
import api from './api'
import { User } from './api/user'

const app = express(api)
const server = http.createServer(app)

mongoose.connect(
  mongo.uri,
  // Bug https://github.com/Automattic/mongoose/issues/5399
  { useMongoClient: true, promiseLibrary: global.Promise }
).then(function () {
  const adminEmail = 'admin@example.com'
  User.findOne({ email: adminEmail }, function (err, user) {
    if (err) {
      console.error(err)
      return
    }

    if (user) return

    (new User({
      email: adminEmail,
      password: 'adminadmin',
      role: 'super_admin'
    })).save()
  })
})

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

export default app
