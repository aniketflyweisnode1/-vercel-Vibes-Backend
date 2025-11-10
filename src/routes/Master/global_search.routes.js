const express = require('express');
const router = express.Router();

const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createGlobalSearchSchema,
  updateGlobalSearchSchema,
  getGlobalSearchByIdSchema,
  queryGlobalSearchSchema,
  searchGlobalContentSchema
} = require('../../../validators/global_search.validator');

const {
  createGlobalSearch,
  getAllGlobalSearch,
  getGlobalSearchById,
  updateGlobalSearch,
  deleteGlobalSearch,
  searchGlobalContent
} = require('../../controllers/global_search.controller');

router.post('/create', auth, validateBody(createGlobalSearchSchema), createGlobalSearch);
router.get('/getAll', validateQuery(queryGlobalSearchSchema), getAllGlobalSearch);
router.get('/getById/:id', auth, validateParams(getGlobalSearchByIdSchema), getGlobalSearchById);
router.put('/update', auth, validateBody(updateGlobalSearchSchema), updateGlobalSearch);
router.delete('/delete/:id', auth, validateParams(getGlobalSearchByIdSchema), deleteGlobalSearch);
router.get('/search', validateQuery(searchGlobalContentSchema), searchGlobalContent);

module.exports = router;

