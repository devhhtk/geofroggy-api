import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'

const country = new Hono()

// Test route to verify mounting
country.get('/test', (c) => c.json({ message: 'Country router is active' }))

// Get all countries (useful for list views)
country.get('/', async (c) => {
    try {
        const supabase = getSupabase(c.env)

        const { data, error } = await supabase
            .from('countries')
            .select('*')

        if (error) {
            console.error(error)
            return c.json({ error: error.message }, 500)
        }

        return c.json(data)

    } catch (err) {
        console.error(err)
        return c.json({ error: err.message }, 500)
    }
})

// Get country by name
country.get('/:name', async (c) => {
    const name = c.req.param('name')
    const supabase = getSupabase(c.env)

    try {
        const { data, error } = await supabase
            .from('countries')
            .select('*')
            .ilike('name', name)
            .single()

        if (error) {
            // PGRST116 is the error code for 'no rows returned'
            if (error.code === 'PGRST116') {
                return c.json({ error: `Country '${name}' not found` }, 404)
            }
            return c.json({ error: error.message }, 500)
        }

        return c.json(data)
    } catch (err) {
        return c.json({ error: err.message }, 500)
    }
})

export default country