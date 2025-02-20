const express = require('express');
const { getAllTodos, getTodo, createTodo, removeTodo, modifyTodo } = require('../controller/todoController');
const router = express.Router();

router.get('/', getAllTodos);
router.get('/:id', getTodo);
router.post('/', createTodo);
router.delete('/:id', removeTodo);
router.put('/:id', modifyTodo);

module.exports = router;
