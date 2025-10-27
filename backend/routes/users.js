const express = require('express');
const { protect } = require('../middleware/auth');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
