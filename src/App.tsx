/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef } from 'react';
import ch from 'classnames';
import { useEffect, useState } from 'react';
import * as api from './todos';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoEditId, setTodoEditId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [queryChangeTodo, setQueryChangeTodo] = useState<string>('');
  const normalizeQueryChangeTodo = queryChangeTodo.trim();
  const normalizeQuery = query.trim();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  console.log(queryChangeTodo);
  useEffect(() => {
    api.getAll().then(setTodos);
  }, []);

  const handlerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const newTodo = await api.createTodo(normalizeQuery);
      setTodos((currentPost) => [...currentPost, newTodo]);
      setQuery('');
    } catch (error: unknown) {
      console.error('error =>', (error as Error).message);
    }
  };

  const hanlerDeleteTodo = async (todoId: string) => {
    try {
      const getTodo = todos.filter((todd) => todd.id !== todoId);
      setTodos(getTodo);
      await api.deleteOne(todoId);
    } catch (error: unknown) {
      console.error('error =>', (error as Error).message);
    }
  };

  const handleDoubleClickTodo = (todoId: string, todoTitle: string) => {
    setTodoEditId(todoId);
    setQueryChangeTodo(todoTitle);
  };

  const handleUpdateTodo = async (
    event: React.FormEvent,
    todoId: string,
    complited: boolean,
  ) => {
    event.preventDefault();
    try {
      const todo: Todo | undefined = todos.find((todo) => todo.id === todoId);
      if (todo) {
        Object.assign(todo, { title: normalizeQueryChangeTodo });
      }
      const updatedTodo: Todo = {
        id: todoId,
        title: normalizeQueryChangeTodo,
        complited: complited,
      };

      if (normalizeQueryChangeTodo.length === 0) {
        hanlerDeleteTodo(todoId);
      }

      await api.updateTodo(updatedTodo);
      setTodoEditId(null);
      setIsEditing(false);
    } catch (error: unknown) {
      console.error('error =>', (error as Error).message);
    }
  };

  // const handleOnBlurChangeTodo = async (
  //   event: React.FormEvent,
  //   todoId: string,
  //   complited: boolean,
  // ) => {
  //   event.preventDefault();
  //   try {
  //     const todo: Todo | undefined = todos.find((todo) => todo.id === todoId);
  //     if (todo) {
  //       Object.assign(todo, { title: queryChangeTodo });
  //     }
  //     const updatedTodo: Todo = {
  //       id: todoId,
  //       title: normalizeQueryChangeTodo,
  //       complited: complited,
  //     };
  //     await api.updateTodo(updatedTodo);
  //     setTodoEditId(null);
  //     setIsEditing(false);
  //   } catch (error: unknown) {
  //     console.error('error =>', (error as Error).message);
  //   }
  // };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing, todoEditId]);

  useEffect(() => {
    if (todoEditId !== null) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [todoEditId, todos]);

  console.log(todos);
  return (
    <div className="todoapp">
      <header className="header">
        <h1>todos</h1>

        <form onSubmit={handlerSubmit}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            data-cy="createTodo"
            className="new-todo"
            placeholder="What needs to be done?"
          />
        </form>
      </header>

      <section className="main">
        <input
          type="checkbox"
          id="toggle-all"
          className="toggle-all"
          data-cy="toggleAll"
        />
        <label htmlFor="toggle-all">Mark all as complete</label>

        <ul className="todo-list" data-cy="todoList">
          {todos.length > 0 &&
            todos.map((todo) => (
              <li
                onDoubleClick={() => handleDoubleClickTodo(todo.id, todo.title)}
                className={ch({
                  editing: todo.id === todoEditId && todoEditId !== null,
                })}
                key={todo.id}
              >
                <div className="view">
                  <input type="checkbox" className="toggle" id="toggle-view" />
                  <label htmlFor="toggle-view">{todo.title}</label>
                  <button
                    onClick={() => hanlerDeleteTodo(todo.id)}
                    type="button"
                    className="destroy"
                    data-cy="deleteTodo"
                  />
                </div>

                <form
                  onSubmit={(e) => handleUpdateTodo(e, todo.id, todo.complited)}
                >
                  <input
                    onChange={(e) => setQueryChangeTodo(e.target.value)}
                    value={queryChangeTodo}
                    type="text"
                    className="edit"
                    ref={todo.id === todoEditId ? inputRef : undefined}
                    onBlur={(e) => handleUpdateTodo(e, todo.id, todo.complited)}
                  />
                </form>
              </li>
            ))}

          {/* <li className="completed">
            <div className="view">
              <input type="checkbox" className="toggle" id="toggle-completed" />
              <label htmlFor="toggle-completed">qwertyuio</label>
              <button type="button" className="destroy" data-cy="deleteTodo" />
            </div>
            <input type="text" className="edit" />
          </li> */}
        </ul>
      </section>

      <footer className="footer">
        <span className="todo-count" data-cy="todosCounter">
          3 items left
        </span>

        <ul className="filters">
          <li>
            <a href="#/" className="selected">
              All
            </a>
          </li>

          <li>
            <a href="#/active">Active</a>
          </li>

          <li>
            <a href="#/completed">Completed</a>
          </li>
        </ul>

        <button type="button" className="clear-completed">
          Clear completed
        </button>
      </footer>
    </div>
  );
};
