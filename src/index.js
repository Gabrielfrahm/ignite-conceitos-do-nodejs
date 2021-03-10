const express = require('express');
const {v4: uuid} = require('uuid')
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).send({error:'user not found'});
  }

  request.user = user;

  return next();
}


function checksExistsTodoUser (request, response, next){
  const {id} = request.params;
  const { user } = request;

  const todos = user.todos;

  const todo = todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).send({error:'todo not found'});
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const { name , username} = request.body;

  const checkUser = users.some( user => user.username === username );

  if(checkUser){
    return response.status(400).send({error: 'user already existis!'})
  }

  const user = {
    id : uuid(),
    name,
    username,
    todos: [],
  };
  
  users.push(user);
  
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline} = request.body;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at : new Date(), 
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodoUser, (request, response) => {
  const { title, deadline} = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodoUser, (request, response) => {
  // Complete aqui
  const { todo } = request;

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodoUser, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo.id, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;