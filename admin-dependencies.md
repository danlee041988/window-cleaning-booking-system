# Admin Dashboard Dependencies

You'll need to install these additional packages for the admin dashboard:

```bash
npm install @supabase/supabase-js react-router-dom @heroicons/react date-fns recharts
```

## Package Descriptions:

- **@supabase/supabase-js**: Supabase client for database operations
- **react-router-dom**: Routing for the admin pages
- **@heroicons/react**: Beautiful icons for the UI
- **date-fns**: Date formatting and manipulation
- **recharts**: Charts and graphs for reporting dashboard

## Setup Instructions:

1. Run the npm install command above
2. Copy `.env.local.example` to `.env.local`
3. Set up your Supabase project and add the credentials to `.env.local`
4. Run the SQL schema file in your Supabase dashboard
5. Start the development server with `npm start`

The admin dashboard will be available at `/admin/login`