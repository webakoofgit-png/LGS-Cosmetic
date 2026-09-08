import { Op } from "sequelize";

function parseJsonField(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function normalizeBody(body) {
  const next = { ...body };
  for (const key of ["additionalImages", "variants", "tags", "types"]) {
    if (key in next) next[key] = parseJsonField(next[key]);
  }
  return next;
}

export function createCrudController(Model, options = {}) {
  const { searchFields = [], includes = [] } = options;

  return {
    async list(req, res, next) {
      try {
        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
        const q = String(req.query.q || "").trim();
        const where = {};

        if (q && searchFields.length > 0) {
          where[Op.or] = searchFields.map((field) => ({
            [field]: { [Op.like]: `%${q}%` },
          }));
        }

        const { count, rows } = await Model.findAndCountAll({
          where,
          include: includes,
          limit,
          offset: (page - 1) * limit,
          order: [["createdAt", "DESC"]],
        });

        res.json({
          success: true,
          data: rows,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.max(Math.ceil(count / limit), 1),
          },
        });
      } catch (error) {
        next(error);
      }
    },

    async getById(req, res, next) {
      try {
        const item = await Model.findByPk(req.params.id, { include: includes });
        if (!item) {
          return res.status(404).json({ success: false, message: "Record not found" });
        }
        return res.json({ success: true, data: item });
      } catch (error) {
        next(error);
      }
    },

    async create(req, res, next) {
      try {
        const payload = normalizeBody(req.body);
        const item = await Model.create(payload);
        return res.status(201).json({ success: true, message: "Created successfully", data: item });
      } catch (error) {
        next(error);
      }
    },

    async update(req, res, next) {
      try {
        const payload = normalizeBody(req.body);
        const item = await Model.findByPk(req.params.id);
        if (!item) {
          return res.status(404).json({ success: false, message: "Record not found" });
        }
        await item.update(payload);
        return res.json({ success: true, message: "Updated successfully", data: item });
      } catch (error) {
        next(error);
      }
    },

    async remove(req, res, next) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) {
          return res.status(404).json({ success: false, message: "Record not found" });
        }
        await item.destroy();
        return res.json({ success: true, message: "Deleted successfully" });
      } catch (error) {
        next(error);
      }
    },
  };
}
