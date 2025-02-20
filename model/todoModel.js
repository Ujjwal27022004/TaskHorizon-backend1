const db = require('../config/database');

// Get all todos
const getTodos = (callback) => {
    db.query('SELECT * FROM todos', (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

// Get a todo by ID
const getTodoById = (id, callback) => {
    db.query('SELECT * FROM todos WHERE id = ?', [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
    });
};

// Add a new todo
const addTodo = (text, callback) => {
    db.query('INSERT INTO todos (text) VALUES (?)', [text], (err, results) => {
        if (err) return callback(err);
        callback(null, { id: results.insertId, text, completed: false });
    });
};

// Delete a todo by ID
const deleteTodo = (id, callback) => {
    db.query('DELETE FROM todos WHERE id = ?', [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

// Update a todo's text and/or completion status
const updateTodo = (id, text, completed, callback) => {
    const fields = [];
    const values = [];

    if (text !== undefined) {
        fields.push('text = ?');
        values.push(text);
    }
    if (completed !== undefined) {
        fields.push('completed = ?');
        values.push(completed);
    }

    if (fields.length === 0) {
        return callback('No fields to update');
    }

    const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    db.query(query, values, (err, results) => {
        if (err) return callback(err);
        if (results.affectedRows === 0) return callback('Todo not found');
        callback(null, { id, text, completed });
    });
};

module.exports = { getTodos, getTodoById, addTodo, deleteTodo, updateTodo };
