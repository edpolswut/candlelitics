import React, { useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import DashboardCard from '../components/DashboardCard';
import CreateDashboardModal from '../components/CreateDashboardModal';
import './Dashboards.css';

function Dashboards() {
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({ lg: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anyFullscreen, setAnyFullscreen] = useState(false);
  const [width, setWidth] = useState(window.innerWidth - 80);

  const carregarCards = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Você precisa estar logado para ver seus dashboards.');
        return;
      }

      const resposta = await fetch('http://localhost:3001/api/dashboards/principal/cards', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.erro);
        return;
      }

      const widgetsBanco = dados.map((card) => ({
        id: String(card.Id),
        ativos: [card.Ticker],
        tipo_grafico: card.TipoGrafico,
        title: `${card.Ticker} - ${card.TipoGrafico}`
      }));

      const layoutBanco = dados.map((card) => ({
        i: String(card.Id),
        x: card.X,
        y: card.Y,
        w: card.W,
        h: card.H
      }));

      setWidgets(widgetsBanco);
      setLayouts({ lg: layoutBanco });

    } catch (err) {
      console.log(err);
      alert('Erro ao carregar cards');
    }
  };

  const handleCreateDashboard = async (config) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Você precisa estar logado para criar cards.');
        return;
      }

      const resposta = await fetch('http://localhost:3001/api/dashboards/principal/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ticker: config.stockCode.toUpperCase(),
          tipoGrafico: config.chartType,
          x: 0,
          y: 0,
          w: 4,
          h: 3
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.erro);
        return;
      }

      const novoCard = {
        id: String(dados.id),
        ativos: [dados.ticker],
        tipo_grafico: dados.tipoGrafico,
        title: `${dados.ticker} - ${dados.tipoGrafico}`
      };

      setWidgets((prevCards) => [...prevCards, novoCard]);

      setLayouts((prevLayouts) => ({
        ...prevLayouts,
        lg: [
          ...(prevLayouts.lg || []),
          {
            i: String(dados.id),
            x: dados.x,
            y: dados.y,
            w: dados.w,
            h: dados.h
          }
        ]
      }));

      setIsModalOpen(false);

    } catch (err) {
      console.log(err);
      alert('Erro ao criar card');
    }
  };

  const salvarLayout = async (layout) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;

      for (const item of layout) {
        await fetch(`http://localhost:3001/api/cards/${item.i}/layout`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h
          })
        });
      }

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    carregarCards();

    const handleResize = () => setWidth(window.innerWidth - 80);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onLayoutChange = (layout, allLayouts) => {
    setLayouts(allLayouts);
    salvarLayout(layout);
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
            const layoutItem = layouts.lg?.find((l) => l.i === widget.id) || {
              x: 0,
              y: 0,
              w: 4,
              h: 3
            };

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