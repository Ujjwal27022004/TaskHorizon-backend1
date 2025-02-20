const { getTodos, getTodoById, addTodo, deleteTodo, updateTodo } = require('../model/todoModel');

const getAllTodos = (req, res) => {
    getTodos((err, todos) => {
        if (err) return res.status(500).json({ error: err });
        res.json(todos);
    });
};

const getTodo = (req, res) => {
    const { id } = req.params;
    getTodoById(id, (err, todo) => {
        if (err) return res.status(500).json({ error: err });
        if (!todo) return res.status(404).json({ message: 'Todo not found' });
        res.json(todo);
    });
};

const createTodo = (req, res) => {
    const { text } = req.body;
    addTodo(text, (err, newTodo) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json(newTodo);
    });
};

const removeTodo = (req, res) => {
    const { id } = req.params;
    deleteTodo(id, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Todo deleted' });
    });
};

const modifyTodo = (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;

    if (text === undefined && completed === undefined) {
        return res.status(400).json({ message: 'Missing fields to update' });
    }

    updateTodo(id, text, completed, (err, updatedTodo) => {
        if (err) return res.status(500).json({ error: err });
        res.json(updatedTodo);
    });
};

module.exports = { getAllTodos, getTodo, createTodo, removeTodo, modifyTodo };
