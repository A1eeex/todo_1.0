import axios from 'axios';
import { Todo } from './types/Todo';

axios.defaults.baseURL = 'http://localhost:3005';
export function getAll(): Promise<Todo[]> {
  return axios.get('/todos').then((res) => res.data);
}

export async function getOne(todoId: string): Promise<Todo> {
  const response = await axios.get(`/todos/${todoId}`);
  return response.data;
}

export async function deleteOne(todoId: string): Promise<string> {
  const response = await axios.delete(`/todos/${todoId}`);
  return response.statusText;
}

export async function createTodo(title: string): Promise<Todo> {
  const response = await axios.post('/todos/', { title});
  return response.data;
}

export async function updateTodo({ title, complited, id}: Todo): Promise<Todo> {
  const response = await axios.put(`/todos/${id}`, { title, complited});
  return response.data;
}
