/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef } from 'react';
import cn from 'classnames';
import { useEffect, useState } from 'react';
import * as api from './todos';
import { Todo } from './types/Todo';
import { FilterTodosType } from './types/FilterTodos';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoEditId, setTodoEditId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [queryChangeTodo, setQueryChangeTodo] = useState<string>('');
  const normalizeQueryChangeTodo = queryChangeTodo.trim();
  const normalizeQuery = query.trim();
  const [filterTodo, setFilterTodo] = useState(FilterTodosType.All);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filterOptions = [
    { type: FilterTodosType.All, label: FilterTodosType.All },
    { type: FilterTodosType.Active, label: FilterTodosType.Active },
    { type: FilterTodosType.Completed, label: FilterTodosType.Completed },
  ];

  useEffect(() => {
    api.getAll().then(setTodos);
  }, []);

  const filteredTodos = todos.filter((todo) => {
    switch (filterTodo) {
      case FilterTodosType.Active:
        return !todo.completed;
      case FilterTodosType.Completed:
        return todo.completed;
      default:
        return todos;
    }
  });

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
      await api.deleteOne(todoId);
      setTodos(getTodo);
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
    completed: boolean,
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
        completed: completed,
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
  //   completed: boolean,
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
  //       completed: completed,
  //     };
  //     await api.updateTodo(updatedTodo);
  //     setTodoEditId(null);
  //     setIsEditing(false);
  //   } catch (error: unknown) {
  //     console.error('error =>', (error as Error).message);
  //   }
  // };

  const handleCompliteTodo = async (todoId: string) => {
    const updatedTodos = await Promise.all(
      todos.map(async (todo) => {
        if (todo.id === todoId) {
          const updatedTodo: Todo = {
            ...todo,
            completed: !todo.completed,
          };
          await api.updateTodo(updatedTodo);
          return updatedTodo;
        }
        return todo;
      }),
    );

    setTodos(updatedTodos);
  };

  const handlerToggleAll = async () => {
    try {
      const allCompleted = todos.every((todo) => todo.completed === true);

      await Promise.all(
        todos.map(async (todo) => {
          await api.updateTodo({ ...todo, completed: !allCompleted });
        }),
      );
      setTodos((prevTodos) =>
        prevTodos.map((todo) => ({ ...todo, completed: !allCompleted })),
      );
    } catch (error) {
      console.error('Error updating todos:', error);
    }
  };

  const handlerClearCompletedTodo = async () => {
    const completedTodos = todos.filter((todo) => todo.completed);
    try {
      const deletionPromises = completedTodos.map((todo) =>
        hanlerDeleteTodo(todo.id),
      );
      await Promise.all(deletionPromises);

      const updatedTodos = todos.filter((todo) => !todo.completed);
      setTodos(updatedTodos);
    } catch (error: unknown) {
      console.error('error =>', (error as Error).message);
    }
  };

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

  return (
    <div className="todoapp">
      <header className="header">
        <h1>Todos</h1>

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
        <label onClick={() => handlerToggleAll()} htmlFor="toggle-all">
          Mark all as complete
        </label>

        <ul className="todo-list" data-cy="todoList">
          {filteredTodos.length > 0 ? (
            <>
              {filteredTodos.map((todo) => (
                <li
                  onDoubleClick={() =>
                    handleDoubleClickTodo(todo.id, todo.title)
                  }
                  className={cn({
                    editing: todo.id === todoEditId && todoEditId !== null,
                    completed: todo.completed,
                  })}
                  key={todo.id}
                >
                  <div className="view">
                    <input
                      onChange={() => handleCompliteTodo(todo.id)}
                      checked={todo.completed}
                      type="checkbox"
                      className="toggle"
                      id={`toggle-view${todo.id}`}
                    />
                    <label htmlFor="toggle-view">{todo.title}</label>
                    <button
                      onClick={() => hanlerDeleteTodo(todo.id)}
                      type="button"
                      className="destroy"
                      data-cy="deleteTodo"
                    />
                  </div>

                  <form
                    onSubmit={(e) =>
                      handleUpdateTodo(e, todo.id, todo.completed)
                    }
                  >
                    <input
                      onChange={(e) => setQueryChangeTodo(e.target.value)}
                      value={queryChangeTodo}
                      type="text"
                      className="edit"
                      ref={todo.id === todoEditId ? inputRef : undefined}
                      onBlur={(e) =>
                        handleUpdateTodo(e, todo.id, todo.completed)
                      }
                    />
                  </form>
                </li>
              ))}
            </>
          ) : (
            <>
              <li className={'empty-todo'}>Pleas add some todo</li>
            </>
          )}
        </ul>
      </section>

      <footer className="footer">
        <span
          className={cn('todo-count', {
            'hidden': filteredTodos.length=== 0
          })}
          data-cy="todosCounter"
        >
          {`${filteredTodos.length} items left`}
        </span>

        <ul className="filters">
          {filterOptions.map((option) => (
            <li key={option.type} onClick={() => setFilterTodo(option.type)}>
              <a
                href={`#/${option.type}`}
                className={filterTodo === option.type ? 'selected' : ''}
              >
                {option.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          onClick={() => handlerClearCompletedTodo()}
          type="button"
          className="clear-completed"
        >
          Clear completed
        </button>
      </footer>
    </div>
  );
};
