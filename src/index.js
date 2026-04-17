import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth'
import country from './routes/country'

const app = new Hono()

// Enable CORS for local development
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.get('/', (c) => {
  return c.json({
    message: 'Welcome to GeoFroggy API (Vanilla JS)!',
    status: 'online',
    timestamp: new Date().toISOString()
  })
})

// Example endpoint for testing
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', environment: 'local-development' })
})

app.route('/api/auth', auth)
app.route('/api/country', country)

app.get('/api/test', (c) => {
  return c.json({
    message: 'Welcome to GeoFroggy API (Vanilla JS)!!!!',
    status: 'online',
    timestamp: new Date().toISOString()
  })
})
// app.route('/api/countries', country)

export default app
