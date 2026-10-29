/**
 * MediRemind — Medicine Data Access Model
 * Week 4 Deliverable
 * Author: Francis John Empil (Back-End Developer)
 */

module.exports = (pool) => {
  return {
    /**
     * Find all medicines owned by user (with optional dependent filter)
     */
    async findByUser(userId, dependentId = null) {
      let query = `
        SELECT 
          id, user_id, dependent_id, name, dosage, form, instructions, 
          stock_count, low_stock_threshold, color, shape, icon, created_at,
          (stock_count <= low_stock_threshold) AS is_low_stock
        FROM medicines
        WHERE user_id = $1
      `;
      const params = [userId];

      if (dependentId !== null) {
        query += ` AND dependent_id = $2`;
        params.push(dependentId);
      } else {
        query += ` AND dependent_id IS NULL`;
      }

      query += ` ORDER BY name ASC`;
      const res = await pool.query(query, params);
      return res.rows;
    },

    /**
     * Find single medicine by primary key
     */
    async findById(id) {
      const query = `
        SELECT 
          id, user_id, dependent_id, name, dosage, form, instructions, 
          stock_count, low_stock_threshold, color, shape, icon, created_at,
          (stock_count <= low_stock_threshold) AS is_low_stock
        FROM medicines
        WHERE id = $1
      `;
      const res = await pool.query(query, [id]);
      return res.rows[0] || null;
    },

    /**
     * Create a new medicine record
     */
    async create(data) {
      const query = `
        INSERT INTO medicines (
          user_id, dependent_id, name, dosage, form, instructions,
          stock_count, low_stock_threshold, color, shape, icon
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
      const values = [
        data.user_id,
        data.dependent_id || null,
        data.name,
        data.dosage,
        data.form || 'tablet',
        data.instructions || '',
        data.stock_count !== undefined ? data.stock_count : 30,
        data.low_stock_threshold !== undefined ? data.low_stock_threshold : 5,
        data.color || '#0d9488',
        data.shape || 'round',
        data.icon || 'pill'
      ];
      const res = await pool.query(query, values);
      const row = res.rows[0];
      row.is_low_stock = row.stock_count <= row.low_stock_threshold;
      return row;
    },

    /**
     * Update an existing medicine record with ownership check
     */
    async update(id, userId, fields) {
      const allowedFields = [
        'name', 'dosage', 'form', 'instructions', 'stock_count',
        'low_stock_threshold', 'color', 'shape', 'icon', 'dependent_id'
      ];
      const setClauses = [];
      const values = [id, userId];
      let paramIndex = 3;

      for (const key of allowedFields) {
        if (fields[key] !== undefined) {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(fields[key]);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) {
        return this.findById(id);
      }

      const query = `
        UPDATE medicines
        SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *;
      `;
      const res = await pool.query(query, values);
      const row = res.rows[0];
      if (row) {
        row.is_low_stock = row.stock_count <= row.low_stock_threshold;
      }
      return row;
    },

    /**
     * Delete medicine record with ownership check
     */
    async delete(id, userId) {
      const query = `
        DELETE FROM medicines
        WHERE id = $1 AND user_id = $2
        RETURNING id;
      `;
      const res = await pool.query(query, [id, userId]);
      return res.rowCount > 0;
    }
  };
};
