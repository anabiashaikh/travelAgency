const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');

// GET /api/properties - Get all active properties
router.get('/', async (req, res, next) => {
    try {
        const resProps = await query(`
            SELECT p.*, 
                   COALESCE(json_agg(DISTINCT r.*) FILTER (WHERE r.id IS NOT NULL), '[]') as room_types,
                   COALESCE(json_agg(DISTINCT a.amenity_name) FILTER (WHERE a.id IS NOT NULL), '[]') as amenities
            FROM properties p
            LEFT JOIN room_types r ON r.property_id = p.id
            LEFT JOIN property_amenities a ON a.property_id = p.id
            WHERE p.is_active = true
            GROUP BY p.id
            ORDER BY p.star_rating DESC, p.name ASC;
        `);

        return res.json({
            success: true,
            count: resProps.rows.length,
            data: resProps.rows
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/properties/:slug - Get single property by slug or ID
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const resProp = await query(`
            SELECT p.*, 
                   COALESCE(json_agg(DISTINCT r.*) FILTER (WHERE r.id IS NOT NULL), '[]') as room_types,
                   COALESCE(json_agg(DISTINCT a.*) FILTER (WHERE a.id IS NOT NULL), '[]') as amenities,
                   COALESCE(json_agg(DISTINCT img.*) FILTER (WHERE img.id IS NOT NULL), '[]') as images
            FROM properties p
            LEFT JOIN room_types r ON r.property_id = p.id
            LEFT JOIN property_amenities a ON a.property_id = p.id
            LEFT JOIN property_images img ON img.property_id = p.id
            WHERE (p.slug = $1 OR p.id = $1) AND p.is_active = true
            GROUP BY p.id
            LIMIT 1;
        `, [slug]);

        if (resProp.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PROPERTY_NOT_FOUND',
                    message: `Property '${slug}' not found.`
                }
            });
        }

        return res.json({
            success: true,
            data: resProp.rows[0]
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
