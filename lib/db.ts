import { Pool } from 'pg';

const globalForPool = globalThis as unknown as { pgPool: Pool };

const pool = globalForPool.pgPool ?? new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPool.pgPool = pool;
}

export const db = {
  query: async (query: string, params?: any[]) => {
    try {
      const result = await pool.query(query, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  queryOne: async (query: string, params?: any[]) => {
    const result = await db.query(query, params);
    return result.rows[0] || null;
  },

  queryAll: async (query: string, params?: any[]) => {
    const result = await db.query(query, params);
    return result.rows;
  },

  execute: async (query: string, params?: any[]) => {
    const result = await db.query(query, params);
    return result.rowCount || 0;
  }
};

export const queries = {
  // ==================== USERS ====================
  users: {
    findByEmail: async (email: string) => {
      return db.queryOne('SELECT * FROM users WHERE email = $1', [email]);
    },

    findById: async (id: number) => {
      return db.queryOne('SELECT * FROM users WHERE id = $1', [id]);
    },

    create: async (data: {
      name: string;
      email: string;
      password_hash: string;
      role: string;
    }) => {
      return db.queryOne(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.name, data.email, data.password_hash, data.role]
      );
    },

    update: async (id: number, data: Partial<{
      name: string;
      email: string;
      password_hash: string;
      role: string;
      status: string;
      avatar_url: string;
    }>) => {
      const fields: string[] = [];
      const params: any[] = [];
      let i = 1;
      Object.entries(data).forEach(([key, value]) => {
        fields.push(`${key} = $${i}`);
        params.push(value);
        i++;
      });
      params.push(id);
      return db.queryOne(
        `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
        params
      );
    },

    updateLastLogin: async (id: number) => {
      return db.execute('UPDATE users SET last_login = NOW() WHERE id = $1', [id]);
    },

    delete: async (id: number) => {
      return db.execute('DELETE FROM users WHERE id = $1', [id]);
    },

    getAll: async (filters?: { role?: string; status?: string }) => {
      let query = 'SELECT id, name, email, role, status, avatar_url, last_login, created_at FROM users WHERE 1=1';
      const params: any[] = [];
      let i = 1;

      if (filters?.role) {
        query += ` AND role = $${i}`;
        params.push(filters.role);
        i++;
      }
      if (filters?.status) {
        query += ` AND status = $${i}`;
        params.push(filters.status);
        i++;
      }

      query += ' ORDER BY created_at DESC';
      return db.queryAll(query, params);
    }
  },

  // ==================== PLACES ====================
  places: {
    getAll: async (filters?: { category?: string; status?: string; search?: string }) => {
      let query = 'SELECT * FROM places WHERE 1=1';
      const params: any[] = [];
      let i = 1;

      if (filters?.category) {
        query += ` AND category = $${i}`;
        params.push(filters.category);
        i++;
      }
      if (filters?.status) {
        query += ` AND status = $${i}`;
        params.push(filters.status);
        i++;
      }
      if (filters?.search) {
        query += ` AND (name ILIKE $${i} OR location ILIKE $${i})`;
        params.push(`%${filters.search}%`);
        i++;
      }

      query += ' ORDER BY created_at DESC';
      return db.queryAll(query, params);
    },

    getById: async (id: number) => {
      return db.queryOne('SELECT * FROM places WHERE id = $1', [id]);
    },

    getBySlug: async (slug: string) => {
      return db.queryOne('SELECT * FROM places WHERE slug = $1', [slug]);
    },

    create: async (data: any) => {
      return db.queryOne(
        `INSERT INTO places (
          slug, name, category, subcategory, category_badge,
          location, latitude, longitude, rating, distance,
          tags, image_url, short_description, full_description, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          data.slug, data.name, data.category, data.subcategory, data.category_badge,
          data.location, data.latitude || null, data.longitude || null,
          data.rating || 0, data.distance || 0,
          data.tags || [], data.image_url || null,
          data.short_description || null, data.full_description || null,
          data.status || 'draft', data.created_by || null
        ]
      );
    },

    update: async (id: number, data: any) => {
      const fields: string[] = [];
      const params: any[] = [];
      let i = 1;

      Object.entries(data).forEach(([key, value]) => {
        fields.push(`${key} = $${i}`);
        params.push(value);
        i++;
      });

      params.push(id);
      return db.queryOne(
        `UPDATE places SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
        params
      );
    },

    delete: async (id: number) => {
      return db.execute('DELETE FROM places WHERE id = $1', [id]);
    },

    incrementViews: async (id: number) => {
      return db.execute(
        'UPDATE places SET views_count = views_count + 1 WHERE id = $1',
        [id]
      );
    },

    recalculateRating: async (placeId: number) => {
      return db.execute(
        `UPDATE places SET rating = (
          SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
          FROM reviews WHERE place_id = $1 AND status = 'approved'
        ) WHERE id = $1`,
        [placeId]
      );
    },

    getSubcategories: async (category: string): Promise<string[]> => {
      const rows = await db.queryAll(
        `SELECT DISTINCT subcategory FROM places
         WHERE category = $1 AND status = 'published' AND subcategory IS NOT NULL AND subcategory != ''
         ORDER BY subcategory ASC`,
        [category]
      );
      return rows.map((r: any) => r.subcategory);
    }
  },

  // ==================== REVIEWS ====================
  reviews: {
    getAll: async (filters?: { place_id?: number; status?: string }) => {
      let query = `
        SELECT r.*, p.name as place_name
        FROM reviews r
        LEFT JOIN places p ON r.place_id = p.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let i = 1;

      if (filters?.place_id) {
        query += ` AND r.place_id = $${i}`;
        params.push(filters.place_id);
        i++;
      }
      if (filters?.status) {
        query += ` AND r.status = $${i}`;
        params.push(filters.status);
        i++;
      }

      query += ' ORDER BY r.created_at DESC';
      return db.queryAll(query, params);
    },

    updateStatus: async (id: number, status: string, reviewed_by: number) => {
      return db.queryOne(
        `UPDATE reviews SET status = $1, reviewed_by = $2, reviewed_at = NOW()
         WHERE id = $3 RETURNING *`,
        [status, reviewed_by, id]
      );
    },

    create: async (data: {
      place_id: number;
      user_name: string;
      user_email?: string;
      rating: number;
      comment?: string;
    }) => {
      return db.queryOne(
        `INSERT INTO reviews (place_id, user_name, user_email, rating, comment, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [data.place_id, data.user_name, data.user_email || null, data.rating, data.comment || null]
      );
    },

    getById: async (id: number) => {
      return db.queryOne('SELECT * FROM reviews WHERE id = $1', [id]);
    },

    delete: async (id: number) => {
      return db.execute('DELETE FROM reviews WHERE id = $1', [id]);
    }
  },

  // ==================== ANALYTICS ====================
  analytics: {
    trackEvent: async (data: {
      place_id?: number;
      event_type: string;
      metadata?: any;
      ip_address?: string;
      user_agent?: string;
    }) => {
      return db.execute(
        `INSERT INTO analytics (place_id, event_type, metadata, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          data.place_id || null,
          data.event_type,
          JSON.stringify(data.metadata || {}),
          data.ip_address || null,
          data.user_agent || null
        ]
      );
    },

    getDashboardStats: async () => {
      return db.queryOne('SELECT * FROM dashboard_stats');
    },

    getPopularPlaces: async (limit: number = 10) => {
      return db.queryAll('SELECT * FROM popular_places LIMIT $1', [limit]);
    },

    getPlacesByCategory: async () => {
      return db.queryAll(
        `SELECT category, COUNT(*) as count FROM places
         WHERE status = 'published' GROUP BY category ORDER BY count DESC`
      );
    },

    getRecentEvents: async (days: number = 7) => {
      return db.queryAll(
        `SELECT DATE(created_at) as date, event_type, COUNT(*) as count
         FROM analytics
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY DATE(created_at), event_type
         ORDER BY date ASC`
      );
    }
  },

  // ==================== REPORTS ====================
  reports: {
    ensureTable: async () => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS reports (
          id SERIAL PRIMARY KEY,
          place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
          place_name TEXT NOT NULL,
          reason TEXT NOT NULL,
          description TEXT,
          reporter_name TEXT,
          reporter_email TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
          reviewed_by INTEGER REFERENCES users(id),
          reviewed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
    },

    create: async (data: {
      place_id: number;
      place_name: string;
      reason: string;
      description?: string;
      reporter_name?: string;
      reporter_email?: string;
    }) => {
      await queries.reports.ensureTable();
      return db.queryOne(
        `INSERT INTO reports (place_id, place_name, reason, description, reporter_name, reporter_email)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [data.place_id, data.place_name, data.reason, data.description || null,
         data.reporter_name || null, data.reporter_email || null]
      );
    },

    getAll: async (filters?: { status?: string }) => {
      await queries.reports.ensureTable();
      let query = `SELECT * FROM reports WHERE 1=1`;
      const params: any[] = [];
      let i = 1;
      if (filters?.status) {
        query += ` AND status = $${i}`;
        params.push(filters.status);
        i++;
      }
      query += ' ORDER BY created_at DESC';
      return db.queryAll(query, params);
    },

    updateStatus: async (id: number, status: string, reviewed_by: number) => {
      return db.queryOne(
        `UPDATE reports SET status = $1, reviewed_by = $2, reviewed_at = NOW()
         WHERE id = $3 RETURNING *`,
        [status, reviewed_by, id]
      );
    },

    getCount: async () => {
      const row = await db.queryOne(`SELECT COUNT(*) as count FROM reports WHERE status = 'pending'`);
      return Number(row?.count ?? 0);
    }
  },

  // ==================== AUDIT LOGS ====================
  audit: {
    log: async (data: {
      user_id: number;
      action: string;
      resource_type?: string;
      resource_id?: number;
      old_data?: any;
      new_data?: any;
      ip_address?: string;
    }) => {
      return db.execute(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_data, new_data, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          data.user_id,
          data.action,
          data.resource_type || null,
          data.resource_id || null,
          JSON.stringify(data.old_data || {}),
          JSON.stringify(data.new_data || {}),
          data.ip_address || null
        ]
      );
    },

    getRecent: async (limit: number = 50) => {
      return db.queryAll(
        `SELECT a.*, u.name as user_name
         FROM audit_logs a
         LEFT JOIN users u ON a.user_id = u.id
         ORDER BY a.created_at DESC
         LIMIT $1`,
        [limit]
      );
    },

    getByResource: async (resource_type: string, resource_id: number) => {
      return db.queryAll(
        `SELECT a.*, u.name as user_name, u.role as user_role
         FROM audit_logs a
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.resource_type = $1 AND a.resource_id = $2
         ORDER BY a.created_at ASC`,
        [resource_type, resource_id]
      );
    }
  }
};

export default db;
