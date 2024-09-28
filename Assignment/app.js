const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const PORT = 3000;
const JSON_FILE_PATH = path.join(__dirname, 'recipes.json');
const HTML_FILE_PATH = path.join(__dirname, 'public', 'index.html');

const app = express();

app.get('/', (req, res) => {
  fs.readFile(HTML_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading the HTML file.');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

app.get('/recipes', (req, res) => {
  fs.readFile(JSON_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading the JSON file.');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  });
});

// Search recipes by ingredient/name
app.get('/recipes/search', (req, res) => {
  const query = req.query.q;
  fs.readFile(JSON_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading the JSON file.');
      return;
    }
    const recipes = JSON.parse(data);
    const results = recipes.filter((recipe) => {
      return recipe.name.includes(query) || recipe.ingredients.includes(query);
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
});

// Add new recipe
app.post('/recipes', (req, res) => {
  const newRecipe = req.body;
  fs.readFile(JSON_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading the JSON file.');
      return;
    }
    const recipes = JSON.parse(data);
    newRecipe.id = recipes.length + 1;
    recipes.push(newRecipe);
    fs.writeFile(JSON_FILE_PATH, JSON.stringify(recipes, null, 2), (err) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error writing to the JSON file.');
        return;
      }
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newRecipe));
    });
  });
});

// Update existing recipe
app.put('/recipes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedRecipe = req.body;
  fs.readFile(JSON_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading the JSON file.');
      return;
    }
    const recipes = JSON.parse(data);
    const index = recipes.findIndex((recipe) => recipe.id === id);
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Recipe not found');
      return;
    }
    recipes[index] = updatedRecipe;
    fs.writeFile(JSON_FILE_PATH, JSON.stringify(recipes, null, 2), (err) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error writing to the JSON file.');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updatedRecipe));
    });
  });
});

// Remove recipe
app.delete('/recipes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile(JSON_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading the JSON file.');
      return;
    }
    const recipes = JSON.parse(data);
    const index = recipes.findIndex((recipe) => recipe.id === id);
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      // Remove recipe (continued)
      res.end('Recipe not found');
      return;
    }
    
    fs.writeFile(JSON_FILE_PATH, JSON.stringify(recipes, null, 2), (err) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error writing to the JSON file.');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Recipe deleted successfully' }));
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
