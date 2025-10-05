import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [checkpoints, setCheckpoints] = useState([""]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get("http://localhost:5000/api/todos");
    setTodos(res.data);
  };

  const handleCheckpointChange = (index, value) => {
    const updated = [...checkpoints];
    updated[index] = value;
    setCheckpoints(updated);
  };

  const addCheckpoint = () => setCheckpoints([...checkpoints, ""]);
  const removeCheckpoint = (index) => {
    const updated = checkpoints.filter((_, i) => i !== index);
    setCheckpoints(updated);
  };

  const handleSubmit = async () => {
    const validCheckpoints = checkpoints
      .filter((c) => c.trim() !== "")
      .map((c) => ({ text: c, done: false }));

    const todoData = {
      title,
      checkpoints: validCheckpoints,
      startTime,
      endTime,
    };

    if (editId) {
      await axios.put(`http://localhost:5000/api/todos/${editId}`, todoData);
    } else {
      await axios.post("http://localhost:5000/api/todos", todoData);
    }

    resetForm();
    fetchTodos();
  };

  const resetForm = () => {
    setTitle("");
    setCheckpoints([""]);
    setStartTime("");
    setEndTime("");
    setEditId(null);
  };

  const deleteTodo = async (id) => {
    await axios.delete(`http://localhost:5000/api/todos/${id}`);
    fetchTodos();
  };

  const editTodo = (todo) => {
    setTitle(todo.title);
    setStartTime(todo.startTime);
    setEndTime(todo.endTime);
    setCheckpoints(todo.checkpoints.map((c) => c.text));
    setEditId(todo._id);
  };

  const toggleCheckpoint = async (todoId, index) => {
    const todo = todos.find((t) => t._id === todoId);
    todo.checkpoints[index].done = !todo.checkpoints[index].done;
    await axios.put(`http://localhost:5000/api/todos/${todoId}`, todo);
    fetchTodos();
  };

  const getProgress = (checkpoints) => {
    const done = checkpoints.filter((c) => c.done).length;
    const total = checkpoints.length;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">🎯 My Todo Planner</h1>
        <p className="text-muted">
          Stay organized and manage your tasks efficiently
        </p>
      </div>

      {/* Todo Form */}
      <div className="card shadow-sm border-0 mb-5">
        <div className="card-body p-4">
          <h4 className="mb-4 text-center text-primary fw-semibold">
            {editId ? "✏️ Edit Todo" : "📝 Add New Todo"}
          </h4>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter todo title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Start Time</label>
              <input
                type="time"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">End Time</label>
              <input
                type="time"
                className="form-control"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="form-label fw-semibold">Checkpoints</label>
            {checkpoints.map((cp, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Checkpoint ${index + 1}`}
                  value={cp}
                  onChange={(e) =>
                    handleCheckpointChange(index, e.target.value)
                  }
                />
                <button
                  className="btn btn-outline-danger"
                  onClick={() => removeCheckpoint(index)}>
                  ✕
                </button>
              </div>
            ))}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={addCheckpoint}>
              ➕ Add Checkpoint
            </button>
          </div>

          <div className="text-center mt-4">
            <button className="btn btn-primary me-2" onClick={handleSubmit}>
              {editId ? "💾 Update Todo" : "➕ Add Todo"}
            </button>
            <button className="btn btn-outline-secondary" onClick={resetForm}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="row g-4">
        {todos.map((todo) => (
          <div key={todo._id} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 className="fw-bold text-dark mb-1">{todo.title}</h5>
                  <p className="text-muted mb-2">
                    🕒 {todo.startTime} - {todo.endTime}
                  </p>

                  <div className="progress mb-3" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-success"
                      style={{
                        width: `${getProgress(todo.checkpoints)}%`,
                      }}></div>
                  </div>

                  <ul className="list-group small mb-3">
                    {todo.checkpoints.map((cp, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex align-items-center border-0 border-bottom">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={cp.done}
                          onChange={() => toggleCheckpoint(todo._id, index)}
                        />
                        <span
                          style={{
                            textDecoration: cp.done ? "line-through" : "none",
                            color: cp.done ? "#6c757d" : "#000",
                          }}>
                          {cp.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-end">
                  <button
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() => editTodo(todo)}>
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteTodo(todo._id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {todos.length === 0 && (
          <div className="text-center text-muted mt-5">
            <h5>No todos yet. Start by adding one above!</h5>
          </div>
        )}
      </div>
    </div>
  );
}
