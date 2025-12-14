-- This script is executed by the Superuser (root) against the default context

-- 1. Create the application user and set password
CREATE USER goodreads_user WITH PASSWORD 'secret_pass';

-- 2. Grant privileges on the target database (goodreads) to the new user
GRANT ALL PRIVILEGES ON DATABASE goodreads TO goodreads_user;

-- 3. Create the required tables (Your Step 2 Schema)
-- NOTE: We rely on the Docker entrypoint running this against the target database (goodreads).
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE follows (
  follower_id INT REFERENCES users(id),
  followee_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id)
);

-- 4. Grant ownership of the tables and sequences to the application user
ALTER TABLE users OWNER TO goodreads_user;
ALTER TABLE follows OWNER TO goodreads_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO goodreads_user;