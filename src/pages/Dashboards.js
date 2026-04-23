import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DashboardCard from '../components/DashboardCard';
import './Dashboards.css';

function Dashboards() {
  const [dashboards, setDashboards] = useState([
    { id: '1', title: 'Dashboard 1' },
    { id: '2', title: 'Dashboard 2' }
  ]);
  const [counter, setCounter] = useState(3);

  const addDashboard = () => {
    const newDashboard = {
      id: Date.now().toString(),
      title: `Dashboard ${counter}`
    };
    
    setDashboards([...dashboards, newDashboard]);
    setCounter(counter + 1);
  };

  const moveDashboard = useCallback((dragIndex, hoverIndex) => {
    setDashboards((prevDashboards) => {
      const newDashboards = [...prevDashboards];
      const draggedItem = newDashboards[dragIndex];
      
      newDashboards.splice(dragIndex, 1);
      newDashboards.splice(hoverIndex, 0, draggedItem);
      
      return newDashboards;
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboards-container">
        <button className="add-button" onClick={addDashboard}>
          Criar Novo Dashboard
        </button>
        
        <div className="dashboards-grid">
          {dashboards.length === 0 ? (
            <p className="empty-message">Nenhum dashboard criado.</p>
          ) : (
            dashboards.map((dash, index) => (
              <DashboardCard 
                key={dash.id} 
                id={dash.id}
                index={index}
                title={dash.title} 
                moveDashboard={moveDashboard}
              />
            ))
          )}
        </div>
      </div>
    </DndProvider>
  );
}

export default Dashboards;