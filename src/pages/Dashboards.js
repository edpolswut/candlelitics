import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import DashboardCard from '../components/DashboardCard';
import CreateDashboardModal from '../components/CreateDashboardModal';
import './Dashboards.css';
import ConfirmModal from '../components/ConfirmModal';
import { updateCard } from '../services/api';

function Dashboards() {
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({ lg: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anyFullscreen, setAnyFullscreen] = useState(false);
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, onConfirm: () => {} });
  const [width, setWidth] = useState(window.innerWidth - 80);

  const carregarCards = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Você precisa estar logado para ver seus dashboards.');
        return;
      }

      const resposta = await fetch('http://localhost:3001/api/dashboards/principal/cards', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        toast.error(dados.erro || 'Falha ao carregar os cards.');
        return;
      }

      const widgetsBanco = dados.map((card) => ({
        id: String(card.Id),
        ativos: [card.Ticker],
        tipo_grafico: card.TipoGrafico,
        tipo_ativo: card.TipoAtivo,
        cor: card.Cor, // <-- ADICIONE ISSO
        title: `${card.Ticker} - ${card.TipoGrafico}`
      }));

      const layoutBanco = dados.map((card) => ({
        i: String(card.Id),
        x: card.X,
        y: card.Y,
        w: card.W,
        h: Math.max(card.H, 3) // Garante que a altura mínima seja 3
      }));

      setWidgets(widgetsBanco);
      setLayouts({ lg: layoutBanco });

    } catch (err) {
      console.log(err);
      toast.error('Erro ao carregar os cards.');
    }
  };

  const handleCreateDashboard = async (config) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Você precisa estar logado para criar cards.');
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
          tipoAtivo: config.assetType || 'stock',
          cor: config.color || '#00b746',
          x: 0, y: 0, w: 4, h: 3
        })  
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        toast.error(dados.erro || 'Falha ao criar o card.');
        return;
      }

      const novoCard = {
        id: String(dados.id),
        ativos: [dados.ticker],
        tipo_grafico: dados.tipoGrafico,
        tipo_ativo: dados.tipoAtivo,
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
      toast.error('Erro ao criar o card.');
    }
  };

  const handleUpdateCard = async (id, newConfig) => {
    try {
      const updatedCardData = await updateCard(id, newConfig);
      
      setWidgets(prevWidgets => 
        prevWidgets.map(widget => {
          if (widget.id === id) {
            return {
              ...widget,
              ativos: [updatedCardData.ticker],
              tipo_grafico: updatedCardData.tipoGrafico,
              tipo_ativo: updatedCardData.tipoAtivo,
              title: `${updatedCardData.ticker} - ${updatedCardData.tipoGrafico}`
            };
          }
          return widget;
        })
      );

      toast.success('Card atualizado com sucesso!');

    } catch (err) {
      console.error('Erro ao atualizar card:', err);
      toast.error(err.erro || 'Falha ao atualizar o card.');
    }
  };

  const openDeleteConfirmation = (id) => {
    setConfirmModalState({ isOpen: true, onConfirm: () => executeDelete(id) });
  };

  const executeDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const resposta = await fetch(`http://localhost:3001/api/cards/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        toast.error(dados.erro || 'Erro ao apagar o card');
        return;
      }

      setWidgets((prevWidgets) => prevWidgets.filter((w) => w.id !== id));
      setLayouts((prevLayouts) => ({
        ...prevLayouts,
        lg: prevLayouts.lg ? prevLayouts.lg.filter((l) => l.i !== id) : []
      }));

    } catch (err) {
      console.log(err);
      toast.error('Erro ao comunicar com o servidor.');
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

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const onLayoutChange = (layout, allLayouts) => {
    setLayouts(allLayouts);
    salvarLayout(layout);
  };

  return (
    <div className="dashboards-container">
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
            <div 
              key={widget.id} 
              data-grid={{
                ...layoutItem,
                minW: 2,
                minH: 3}}
              >
              <DashboardCard
                id={widget.id}
                widgetConfig={widget}
                onFullscreenChange={setAnyFullscreen}
                onDelete={openDeleteConfirmation}
                onUpdate={handleUpdateCard}
              />
            </div>
          );
        })}
      </Responsive>

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

      <ConfirmModal 
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState({ isOpen: false, onConfirm: () => {} })}
        onConfirm={confirmModalState.onConfirm}
        title="Confirmar Exclusão"
        message="Tem a certeza que deseja apagar este card? Esta ação não pode ser desfeita."
      />
    </div>
  );
}

export default Dashboards;