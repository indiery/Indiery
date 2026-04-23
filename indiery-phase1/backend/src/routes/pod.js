const router = require('express').Router();
const multer = require('multer');
const { verifyFirebaseToken } = require('../middleware/auth');
const { getPool } = require('../db/pool');
const { uploadPOD, presignedUploadUrl } = require('../services/s3');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/pod/:orderId/pickup — upload pickup photo
router.post('/:orderId/pickup', verifyFirebaseToken, upload.single('photo'), async (req, res) => {
  await handleUpload(req, res, 'pickup');
});

// POST /api/pod/:orderId/drop — upload drop photo
router.post('/:orderId/drop', verifyFirebaseToken, upload.single('photo'), async (req, res) => {
  await handleUpload(req, res, 'drop');
});

async function handleUpload(req, res, stage) {
  const db = getPool();
  try {
    const url = await uploadPOD(req.file.buffer, req.file.mimetype, req.params.orderId, stage);
    const field = stage === 'pickup' ? 'pod_pickup_url' : 'pod_drop_url';
    await db.query(`UPDATE orders SET ${field}=$1 WHERE id=$2`, [url, req.params.orderId]);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/pod/:orderId/presign?stage=pickup — get presigned URL for direct upload
router.get('/:orderId/presign', verifyFirebaseToken, (req, res) => {
  const { stage } = req.query;
  if (!['pickup', 'drop'].includes(stage)) return res.status(400).json({ error: 'stage must be pickup or drop' });
  const url = presignedUploadUrl(req.params.orderId, stage);
  res.json({ uploadUrl: url });
});

module.exports = router;
