// config/db.js
require('dotenv').config();

const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Pool de conexões PostgreSQL (caso você use pg em algum lugar)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = {
  pool,
  supabase
};