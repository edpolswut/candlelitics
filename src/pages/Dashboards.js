import React, { useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import DashboardCard from '../components/DashboardCard';
import CreateDashboardModal from '../components/CreateDashboardModal';
import './Dashboards.css';
import dbMock from '../data/db.json';

function Dashboards() {
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({ lg: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anyFullscreen, setAnyFullscreen] = useState(false);
  
  // Hook que substitui o WidthProvider: calcula a largura da tela menos o padding do Layout (80px)
  const [width, setWidth] = useState(window.innerWidth - 80);

  const handleCreateDashboard = (config) => {
    const novoId = `widget-${Date.now()}`;

    // AQUI ESTÁ A CORREÇÃO: Usando 'ativos' (como array) e 'tipo_grafico'
    const novoCard = {
      id: novoId,
      ativos: [config.stockCode.toUpperCase()], 
      tipo_grafico: config.chartType,           
      title: `${config.stockCode.toUpperCase()} - ${config.chartType}`
    };

    setWidgets((prevCards) => [...prevCards, novoCard]);

    setLayouts((prevLayouts) => ({
      ...prevLayouts,
      lg: [
        ...(prevLayouts.lg || []),
        { i: novoId, x: 0, y: Infinity, w: 4, h: 3 }
      ]
    }));

    setIsModalOpen(false);
  };

  useEffect(() => {
    const layoutInicial = dbMock.layouts_salvos[0].grid_config;
    const widgetsIniciais = dbMock.widgets;
    
    setLayouts({ lg: layoutInicial });
    setWidgets(widgetsIniciais);

    // Atualiza a largura da grade automaticamente se o usuário redimensionar a janela
    const handleResize = () => setWidth(window.innerWidth - 80);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onLayoutChange = (layout, allLayouts) => {
    setLayouts(allLayouts);
    console.log("Novo layout guardado na memória:", layout);
  };

  return (
    <div className="dashboards-container">
      {widgets.length === 0 ? (
        <p className="empty-message">Nenhum dashboard criado.</p>
      ) : (
        <Responsive
          className="layout"
          width={width}
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          margin={[16, 16]}
          isDraggable={!anyFullscreen}
          isResizable={true}
          draggableHandle=".drag-handle"
          draggableCancel=".card-body, .action-btn, .period-select, .export-menu, .graph-container, .header-search-input, .period-filters"
          resizeHandles={["se", "sw", "ne", "nw", "e", "w", "n", "s"]}
        >
          {widgets.map((widget) => {
            // Buscamos a configuração inicial de layout deste widget para forçar a renderização correta
            const layoutItem = layouts.lg?.find(l => l.i === widget.id) || { x: 0, y: 0, w: 4, h: 3 };

            return (
              <div key={widget.id} data-grid={layoutItem}>
                <DashboardCard 
                  id={widget.id}
                  widgetConfig={widget}
                  onFullscreenChange={setAnyFullscreen}
                />
              </div>
            );
          })}
        </Responsive>
      )}

      <button 
        className="fab-button" 
        onClick={() => setIsModalOpen(true)}
        title="Criar Novo Dashboard"
      >
        +
      </button>
      
      <CreateDashboardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleCreateDashboard} 
      />
    </div>
  );
}

export default Dashboards;