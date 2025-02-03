const express = require('express');
const router = express.Router();
const { getTodos, getTodoById, addTodo, deleteTodo, updateTodo } = require('./models');

// Get all todos
router.get('/todos', (req, res) => {
    getTodos((err, todos) => {
        if (err) {
            return res.status(500).json('Error: ' + err);
        }
        res.json(todos);
    });
});

// Get a todo by ID
router.get('/todos/:id', (req, res) => {
    const { id } = req.params;
    getTodoById(id, (err, todo) => {
        if (err) {
            return res.status(500).json('Error: ' + err);
        }
        if (!todo) {
            return res.status(404).json('Error: Todo not found');
        }
        res.json(todo);
    });
});

// Add a new todo
router.post('/todos', (req, res) => {
    const { text } = req.body;
    addTodo(text, (err, newTodo) => {
        if (err) {
            return res.status(500).json('Error: ' + err);
        }
        res.status(201).json(newTodo);
    });
});

// Delete a todo
router.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    deleteTodo(id, (err, result) => {
        if (err) {
            return res.status(500).json('Error: ' + err);
        }
        res.json('Todo deleted');
    });
});

// Update a todo's text and/or completion status
router.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;

    if (text === undefined && completed === undefined) {
        return res.status(400).json('Error: Missing fields to update');
    }

    updateTodo(id, text, completed, (err, updatedTodo) => {
        if (err) {
            return res.status(500).json('Error: ' + err);
        }
        res.json(updatedTodo);
    });
});


router.post('/teams/task', (req, res) => {
    const { taskId, title, createdBy, dueDate } = req.body;

    // Log the received task from Teams
    console.log('Received task from Teams:', {
        taskId,
        title,
        createdBy,
        dueDate
    });

    // Optionally, add the task to the database (similar to adding a todo)
    addTodo(`Task from Teams: ${title}`, (err, newTask) => {
        if (err) {
            return res.status(500).json('Error: ' + err);
        }
        res.status(201).json({
            message: 'Task created successfully from Teams',
            task: newTask
        });
    });
});




module.exports = router;
