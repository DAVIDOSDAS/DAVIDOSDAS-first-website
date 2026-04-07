-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'guest', -- 'guest' or 'worker'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('comment', 'news', 'photo')),
  text TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
