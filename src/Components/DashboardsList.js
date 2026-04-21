import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './DashboardsList.css';
import Dashboard from './Dashboard';

function DraggableDashboard({ dashboard, index, moveDashboard }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'dashboard',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'dashboard',
    hover: (item) => {
      if (item.index !== index) {
        moveDashboard(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className={`grid-item ${isDragging ? 'dragging' : ''}`}>
      <Dashboard data={dashboard} />
    </div>
  );
}

const COLUMNS = 3;

function EmptyCell({ index, moveDashboard }) {
  const [, drop] = useDrop({
    accept: 'dashboard',
    hover: (item) => {
      if (item.index !== index) {
        moveDashboard(item.index, index);
        item.index = index;
      }
    },
    drop: (item) => moveDashboard(item.index, index),
  });

  return <div ref={drop} className="grid-item placeholder" />;
}

const INITIAL_CELL_COUNT = COLUMNS * 2;

function ensureCells(cells) {
  const lastIndex = cells.reduce((current, item, index) => (item ? index : current), -1);
  const lastRow = Math.max(0, Math.floor(lastIndex / COLUMNS));
  const desiredRows = Math.max(2, lastRow + 2);
  const desiredLength = desiredRows * COLUMNS;

  if (cells.length > desiredLength) {
    return cells.slice(0, desiredLength);
  }

  if (cells.length < desiredLength) {
    return [...cells, ...Array(desiredLength - cells.length).fill(null)];
  }

  return cells;
}

function DashboardsList() {
  const [cells, setCells] = useState([
    { id: 1, title: 'Dashboard 1' },
    { id: 2, title: 'Dashboard 2' },
    ...Array(INITIAL_CELL_COUNT - 2).fill(null),
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const moveDashboard = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    setCells((prevCells) => {
      const next = ensureCells(prevCells);
      const nextCells = [...next];
      const sourceItem = nextCells[fromIndex];
      const targetItem = nextCells[toIndex];
      nextCells[toIndex] = sourceItem;
      nextCells[fromIndex] = targetItem || null;
      return ensureCells(nextCells);
    });
  };

  const addDashboard = () => {
    if (!newTitle.trim()) return;

    setCells((prevCells) => {
      const next = ensureCells(prevCells);
      const emptyIndex = next.findIndex((item) => item === null);
      if (emptyIndex !== -1) {
        next[emptyIndex] = { id: Date.now(), title: newTitle };
      } else {
        next.push({ id: Date.now(), title: newTitle });
      }
      return ensureCells(next);
    });

    setNewTitle('');
    setShowModal(false);
  };

  const visibleCells = ensureCells(cells);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboards-container">
        <button className="add-button" onClick={() => setShowModal(true)}>
          Add Dashboard
        </button>

        <div className="dashboards-grid">
          {visibleCells.map((cell, index) =>
            cell ? (
              <DraggableDashboard
                key={cell.id}
                dashboard={cell}
                index={index}
                moveDashboard={moveDashboard}
              />
            ) : (
              <EmptyCell key={`empty-${index}`} index={index} moveDashboard={moveDashboard} />
            )
          )}
        </div>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Add New Dashboard</h2>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter dashboard title"
              />
              <button onClick={addDashboard}>Add</button>
              <button className="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

export default DashboardsList;