import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza o app corretamente', () => {
    render(<App />);
    expect(screen.getByText('Favoritos do GitHub')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite o username do GitHub')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ordenar por nome' })).toBeInTheDocument();
  });

  test('fetches e mostra se os favoritos estão na tela corretamente', async () => {
    const favorites = [
      {
        username: 'user1',
        nome: 'User 1',
        avatar: 'user1-avatar.jpg',
        url: 'https://github.com/user1',
      },
      {
        username: 'user2',
        nome: 'User 2',
        avatar: 'user2-avatar.jpg',
        url: 'https://github.com/user2',
      },
    ];

    axios.get.mockResolvedValue({ data: favorites });

    render(<App />);

    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });

  test('adiciona um favorito corretamente', async () => {
    const favorites = [
      {
        username: 'user1',
        nome: 'User 1',
        avatar: 'user1-avatar.jpg',
        url: 'https://github.com/user1',
      },
    ];

    axios.get.mockResolvedValue({ data: favorites });
    axios.post.mockResolvedValue({ data: { message: 'Usuário adicionado com sucesso.' } });

    render(<App />);

    const usernameInput = screen.getByPlaceholderText('Digite o username do GitHub');
    const addButton = screen.getByRole('button', { name: 'Adicionar' });

    fireEvent.change(usernameInput, { target: { value: 'user2' } });
    fireEvent.click(addButton);

    expect(axios.post).toHaveBeenCalledWith('/users', { username: 'user2' });
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });

});
