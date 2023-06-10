const express = require('express')
const axios = require('axios');

const app = express();
app.use(express.json());

// Dados em memória
let favoriteUsers = [];
let starredUser = null;

// Função auxiliar para verificar se um usuário já foi adicionado à lista
function isUserAdded(username) {
  return favoriteUsers.some(user => user.username === username);
}

// Função auxiliar para verificar se a lista de favoritos já está cheia
function isFavoriteListFull() {
  return favoriteUsers.length >= 5;
}

// Função auxiliar para ordenar a lista de usuários por nome
function sortUsersByName() {
  favoriteUsers.sort((a, b) => a.nome.localeCompare(b.nome));
}

// Rota para adicionar um usuário à lista de favoritos
app.post('/users', async (req, res) => {
  const { username } = req.body;

  // Verificar se a lista está cheia
  if (isFavoriteListFull()) {
    return res.status(400).json({ error: 'A lista de favoritos está cheia.' });
  }

  // Verificar se o usuário já foi adicionado
  if (isUserAdded(username)) {
    return res.status(400).json({ error: 'O usuário já foi adicionado à lista.' });
  }

  try {
    // Obter informações do usuário da API do GitHub
    const response = await axios.get(`https://api.github.com/users/${username}`);
    const { login, name, avatar_url, html_url } = response.data;

    // Adicionar o usuário à lista de favoritos
    favoriteUsers.push({
      username: login,
      nome: name,
      avatar: avatar_url,
      url: html_url
    });

    sortUsersByName();

    return res.status(201).json({ message: 'Usuário adicionado aos favoritos com sucesso.' });
  } catch (error) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }
});

// Rota para listar os usuários favoritos
app.get('/users', (req, res) => {
  return res.json(favoriteUsers);
});

// Rota para remover um usuário da lista de favoritos
app.delete('/users/:username', (req, res) => {
  const { username } = req.params;

  // Verificar se o usuário está na lista
  const index = favoriteUsers.findIndex(user => user.username === username);
  if (index === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado na lista de favoritos.' });
  }

  // Remover o usuário da lista
  favoriteUsers.splice(index, 1);

  if (starredUser && starredUser.username === username) {
    starredUser = null;
  }

  return res.json({ message: 'Usuário removido dos favoritos com sucesso.' });
});

// Rota para marcar/desmarcar um usuário com uma estrela
app.patch('/users/:username/toggle-star', (req, res) => {
  const { username } = req.params;

  // Verificar se o usuário está na lista
  const user = favoriteUsers.find(user => user.username === username);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado na lista de favoritos.' });
  }

  // Verificar se já existe um usuário marcado com estrela
  if (starredUser) {
    if (starredUser.username === username) {
      starredUser = null;
    } else {
      starredUser = user;
    }
  } else {
    starredUser = user;
  }

  return res.json({ message: 'Estrela atualizada com sucesso.' });
});

// Iniciar o servidor
app.listen(5000, () => {
  console.log('Servidor iniciado na porta 5000.');
});
