import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import CandlestickChart from './Graph';
import './DashboardCard.css';

function DashboardCard({ id, title, index, moveDashboard }) {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: 'dashboard',
    hover(item, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveDashboard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'dashboard',
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      className={`dashboard-cell ${isDragging ? 'dragging' : ''}`}
    >
      <div className="dashboard-content">
        <h2>{title}</h2>

        <CandlestickChart />
      </div>
    </div>
  );
}

export default DashboardCard;