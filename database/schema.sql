-- ==========================================
-- EXPLORE BATAM DATABASE SCHEMA
-- For Next.js 14 + Vercel Postgres
-- ==========================================

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_user', 'admin')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar_url TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==================== PLACES TABLE ====================
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('makanan', 'pantai', 'taman', 'shopping', 'wisata')),
  subcategory VARCHAR(50),
  category_badge VARCHAR(100),
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(2, 1) DEFAULT 0,
  distance DECIMAL(5, 2),
  tags TEXT[],
  image_url TEXT,
  gallery_urls TEXT[],
  short_description TEXT,
  full_description TEXT,
  facilities TEXT[],
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  views_count INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_slug ON places(slug);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_rating ON places(rating DESC);

-- ==================== REVIEWS TABLE ====================
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reviews_place ON reviews(place_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ==================== ANALYTICS TABLE ====================
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'search', 'click', 'share'
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_analytics_place ON analytics(place_id);
CREATE INDEX idx_analytics_event ON analytics(event_type);
CREATE INDEX idx_analytics_date ON analytics(created_at);

-- ==================== SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ==================== AUDIT LOGS TABLE ====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  resource_type VARCHAR(50), -- 'place', 'review', 'user'
  resource_id INTEGER,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_date ON audit_logs(created_at);

-- ==================== FUNCTIONS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update place rating from reviews
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE places
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM reviews
    WHERE place_id = NEW.place_id
    AND status = 'approved'
  )
  WHERE id = NEW.place_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update place rating when review is approved
CREATE TRIGGER update_rating_on_review_approve
AFTER INSERT OR UPDATE OF status ON reviews
FOR EACH ROW
WHEN (NEW.status = 'approved')
EXECUTE FUNCTION update_place_rating();

-- ==================== SEED DATA ====================

-- Insert default super user (password: Admin123!)
-- Password hash generated with: bcrypt.hash('Admin123!', 10)
INSERT INTO users (name, email, password_hash, role, status)
VALUES (
  'Super Admin',
  'admin@explorebatam.com',
  '$2a$10$rQZJvHNhOuVxvBkE7xKxMeF5fQY0qVGKxJ/h2xF.HQOvPxNxFxPPi',
  'super_user',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample places (migrate from existing data)
INSERT INTO places (slug, name, category, subcategory, category_badge, location, latitude, longitude, rating, distance, tags, image_url, status)
VALUES
  ('kopi-kenangan', 'Kopi Kenangan', 'makanan', 'kopi', '☕ KOPI', 'Nagoya Hill', 1.1217, 104.0305, 4.8, 2.5, 
   ARRAY['Free WiFi', 'Instagramable'], 
   'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', 
   'published'),
  
  ('warung-pak-kumis', 'Warung Pak Kumis', 'makanan', 'street-food', '🍜 STREET FOOD', 'Batu Aji', 1.0600, 103.9800, 4.6, 3.8,
   ARRAY['Murah Meriah', 'Lokal Banget'],
   'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
   'published'),
  
  ('pantai-melur', 'Pantai Melur', 'pantai', 'pasir-putih', '🏖️ PANTAI', 'Nongsa', 1.1500, 104.0800, 4.7, 8.5,
   ARRAY['Pasir Putih', 'Sunset', 'Swimming'],
   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
   'published'),
  
  ('taman-engku-putri', 'Taman Engku Putri', 'taman', 'jogging', '🌳 TAMAN', 'Batam Centre', 1.0800, 104.0500, 4.5, 3.2,
   ARRAY['Jogging', 'Gratis', 'Playground'],
   'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&w=800&q=80',
   'published'),
  
  ('harbour-bay-mall', 'Harbour Bay Mall', 'shopping', 'mall', '🛍️ MALL', 'Harbour Bay', 1.1300, 104.0100, 4.6, 5.5,
   ARRAY['Mall', 'Fashion', 'Food Court'],
   'https://images.unsplash.com/photo-1519567281799-9e5105b53cb2?auto=format&fit=crop&w=800&q=80',
   'published')

ON CONFLICT (slug) DO NOTHING;

-- ==================== VIEWS FOR ANALYTICS ====================

-- View for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM places WHERE status = 'published') as total_places,
  (SELECT COUNT(*) FROM reviews WHERE status = 'pending') as pending_reviews,
  (SELECT COUNT(*) FROM reviews WHERE status = 'approved') as approved_reviews,
  (SELECT COALESCE(SUM(views_count), 0) FROM places) as total_views,
  (SELECT ROUND(AVG(rating)::numeric, 1) FROM places WHERE rating > 0) as average_rating;

-- View for popular places
CREATE OR REPLACE VIEW popular_places AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.rating,
  p.views_count,
  COUNT(r.id) as review_count
FROM places p
LEFT JOIN reviews r ON p.id = r.place_id AND r.status = 'approved'
WHERE p.status = 'published'
GROUP BY p.id, p.name, p.category, p.rating, p.views_count
ORDER BY p.views_count DESC, p.rating DESC
LIMIT 10;

-- ==================== COMMENTS ====================
COMMENT ON TABLE users IS 'Admin users table - super_user and admin roles';
COMMENT ON TABLE places IS 'Places/locations database';
COMMENT ON TABLE reviews IS 'User reviews for places';
COMMENT ON TABLE analytics IS 'Event tracking for analytics';
COMMENT ON TABLE sessions IS 'User session management';
COMMENT ON TABLE audit_logs IS 'Audit trail for admin actions';
