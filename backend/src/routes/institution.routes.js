const express = require('express');
const router = express.Router();
const { 
  searchInstitutions, 
  claimInstitutionReference, 
  createManualInstitution, 
  approveAccessRequest,
  getInstitutions,
  getMyInstitutionProfile,
  updateMyInstitutionProfile,
  getMyInstitutionLogs,
  clearMyInstitutionLogs,
  getAllInstitutionsAdmin,
  updateInstitutionStatus,
  getInstitutionBySlug
} = require('../controllers/institution.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/search', searchInstitutions);
router.get('/', getInstitutions);

// Institution's own profile routes (MUST be before /:slug)
router.get('/me', protect, authorize('Admin Institution', 'Responsable Communication'), getMyInstitutionProfile);
router.put('/me', protect, authorize('Admin Institution'), updateMyInstitutionProfile);
router.get('/me/logs', protect, authorize('Admin Institution'), getMyInstitutionLogs);
router.delete('/me/logs', protect, authorize('Admin Institution'), clearMyInstitutionLogs);

// Super Admin routes
router.get('/admin/all', protect, authorize('Super Admin'), getAllInstitutionsAdmin);
router.patch('/admin/:id/status', protect, authorize('Super Admin'), updateInstitutionStatus);

// Dynamic slug route (MUST be last among GET routes)
router.get('/:slug', getInstitutionBySlug);

router.post('/claim-reference/:referenceId', protect, claimInstitutionReference);
router.post('/create-manual', protect, createManualInstitution);
router.patch('/request/:id/approve', protect, authorize('Super Admin'), approveAccessRequest);

module.exports = router;
