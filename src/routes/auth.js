import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'

const auth = new Hono()

auth.post('/login', async (c) => {
    const { email, password } = await c.req.json()

    const supabase = getSupabase(c.env)

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        return c.json({ error: error.message }, 401)
    }

    // Fetch profile details
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

    const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', data.user.id)
        .single()

    return c.json({
        message: 'Login success',
        user: data.user,
        profile: profile || null,
        stats: stats || null,
        session: data.session
    })
})

auth.post('/register', async (c) => {
    try {
        const { email, password, username, age_group, role } = await c.req.json()

        if (!email || !password || !username) {
            return c.json({ error: "Email, password, and username required" }, 400)
        }

        const supabase = getSupabase(c.env)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    role: role // 👈 default role
                }
            }
        })

        if (error) {
            return c.json({ error: error.message }, 400)
        }

        // Create a row in the profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: data.user.id,
                    username: username,
                    email: email,
                    avatar_url: "https://ui-avatars.com/api/?name=" + username,
                    age_group: age_group,
                    role: role
                }
            ])

        if (profileError) {
            return c.json({ error: "User registered, but profile creation failed: " + profileError.message }, 500)
        }

        // Initialize user stats
        await supabase
            .from('user_stats')
            .insert([{ user_id: data.user.id }])

        return c.json({
            message: "User registered successfully",
            user: data.user,
            session: data.session
        })

    } catch (err) {
        return c.json({ error: "Something went wrong" }, 500)
    }
})

export default auth