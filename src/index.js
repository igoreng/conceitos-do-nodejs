const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find(user => user.username === username );

  if (!user) {
    return response.status(404).json({
      error: "User not found"
    })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "User already exists!"
    })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todoCreation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todoCreation);

  return response.status(201).json(todoCreation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request
  const { title, deadline } = request.body;

  const verifyIfIdExists = user.todos.findIndex((todo) => todo.id === id);

  if (verifyIfIdExists === -1) {
    return response.status(404).json({
      error: "This ID does not exist!"
    });
  }

  for (userTodo of user.todos) {
    if (userTodo.id === id) {
      userTodo.title = title;
      userTodo.deadline = deadline;
    }
  }

  return response.status(200).json(user.todos[verifyIfIdExists]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const verifyIfIdExists = user.todos.findIndex((todo) => todo.id === id);

  if (verifyIfIdExists === -1) {
    return response.status(404).json({
      error: "This ID does not exist!"
    });
  }

  for (userTodo of user.todos) {
    if (userTodo.id === id) {
      userTodo.done = true;
    }
  }

  return response.status(200).json(user.todos[verifyIfIdExists]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const verifyIfIdExists = user.todos.some((todo) => todo.id === id);

  if (!verifyIfIdExists) {
    return response.status(404).json({
      error: "This ID does not exist!"
    });
  }

  for (userTodo of user.todos) {
    if (userTodo.id === id) {
      user.todos.splice(user.todos.indexOf(userTodo), 1);
    }
  }

  return response.status(204).json()
});

module.exports = app;