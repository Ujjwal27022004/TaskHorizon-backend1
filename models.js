const mysql = require('mysql2');

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: "root", // Replace with your MySQL username
    password: 'admin', // Replace with your MySQL password
    database: 'to_do_app'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL');
});

// Function to get all todos
const getTodos = (callback) => {
    db.query('SELECT * FROM todos', (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
};

// Function to get a todo by ID
const getTodoById = (id, callback) => {
    const query = 'SELECT * FROM todos WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results[0]);
    });
};

// Function to add a new todo
const addTodo = (text, callback) => {
    const query = 'INSERT INTO todos (text) VALUES (?)';
    db.query(query, [text], (err, results) => {
        if (err) {
            return callback(err);
        }
        const newTodo = { id: results.insertId, text, completed: false };
        callback(null, newTodo);
    });
};

// Function to delete a todo by ID
const deleteTodo = (id, callback) => {
    const query = 'DELETE FROM todos WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
};

// Function to update a todo's text and/or completion status
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
        if (err) {
            return callback(err);
        }
        if (results.affectedRows === 0) {
            return callback('Todo not found');
        }
        callback(null, { id, text, completed });
    });
};

module.exports = {
    getTodos,
    getTodoById,
    addTodo,
    deleteTodo,
    updateTodo
};
