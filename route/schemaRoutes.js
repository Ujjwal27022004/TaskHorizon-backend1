const express = require("express");
const { getSchema, updateSchema,bulkUpdateSchema } = require("../controller/schemaController");
const router = express.Router();

router.get("/schema", getSchema);
router.put("/schema", updateSchema);
router.post("/schema/bulk-update", bulkUpdateSchema);


module.exports = router;
