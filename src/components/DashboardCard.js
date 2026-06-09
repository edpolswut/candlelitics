import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaExpandArrowsAlt, FaCompressArrowsAlt, FaTrash, 
  FaSearch, FaSyncAlt, FaEdit, FaDownload, FaPlus 
} from 'react-icons/fa';
import ApexCharts from 'apexcharts'; 
import Graph from './Graph';
import './DashboardCard.css';

const CardHeader = ({ 
  ticker, setTicker, companyMetadata, onDelete, onEdit,
  onToggleFullscreen, isFullscreen, widgetId, activePeriod, setActivePeriod
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [tempTicker, setTempTicker] = useState(ticker);

  const handleExport = (format) => {
    const chart = ApexCharts.getChartByID(widgetId);
    if (!chart) return;

    if (format === 'csv') {
      chart.exports.exportToCSV({
        filename: `${ticker}_dados_historicos`,
        columnDelimiter: ',',
        headerCategory: 'Data',
        headerValue: 'Valor'
      });
    } else if (format === 'png') {
      // Método oficial para converter o gráfico em Base64 e forçar o download
      chart.dataURI().then(({ imgURI }) => {
        const link = document.createElement('a');
        link.href = imgURI;
        link.download = `${ticker}_grafico.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else if (format === 'svg') {
      // Forma 100% segura de exportar SVG capturando o nó do DOM
      const svgElement = document.querySelector(`#${widgetId} svg`);
      if (svgElement) {
        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svgElement);
        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${ticker}_grafico.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
    
    setShowExportMenu(false);
  };

  return (
    <div className="card-header drag-handle">
      <div className="card-info-group">
        {companyMetadata?.logo ? (
          <img src={companyMetadata.logo} alt="logo" className="company-logo-svg" />
        ) : <div className="company-logo-placeholder" />}
        
        {!isSearching ? (
          <div className="company-details" onClick={() => setIsSearching(true)}>
            <span className="ticker-badge">{ticker}</span>
            <span className="company-name-text">{companyMetadata?.name}</span>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setTicker(tempTicker.toUpperCase()); setIsSearching(false); }}>
            <input autoFocus className="header-search-input" value={tempTicker} 
              onChange={(e) => setTempTicker(e.target.value)} onBlur={() => setIsSearching(false)} />
          </form>
        )}
      </div>

      <div className="period-filters">
        <select className="period-select" value={activePeriod} onChange={(e) => setActivePeriod(e.target.value)}>
          <option value="1D">1D</option>
          <option value="1S">1S</option>
          <option value="1M">1M</option>
          <option value="1A">1A</option>
        </select>
      </div>
      
      <div className="card-actions">
        <button title="Comparar" className="action-btn"><FaPlus /></button>
        
        {/* Menu de Exportação */}
        <div className="export-wrapper">
          <button onClick={() => setShowExportMenu(!showExportMenu)} className="action-btn">
            <FaDownload />
          </button>
          {showExportMenu && (
            <div className="export-menu">
              <button onClick={() => handleExport('png')}>PNG</button>
              <button onClick={() => handleExport('svg')}>SVG</button>
              <button onClick={() => handleExport('csv')}>CSV</button>
            </div>
          )}
        </div>

        <button onClick={() => ApexCharts.exec(widgetId, 'resetSeries')} className="action-btn"><FaSyncAlt /></button>
        <button onClick={onEdit} className="action-btn"><FaEdit /></button>
        <button onClick={onToggleFullscreen} className="action-btn">
          {isFullscreen ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
        </button>
        <button onClick={onDelete} className="action-btn delete-btn"><FaTrash /></button>
      </div>
    </div>
  );
};

function DashboardCard({ id, widgetConfig, onFullscreenChange, onDelete }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ticker, setTicker] = useState(widgetConfig.ativos[0]);
  const [metadata, setMetadata] = useState({ name: '', logo: '' });
  const [activePeriod, setActivePeriod] = useState('1M');

  const handleToggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    if (onFullscreenChange) onFullscreenChange(newState);
  };
  // Trava o scroll do body quando em tela cheia
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : 'unset';
  }, [isFullscreen]);

  const cardContent = (
    <div className={`dashboard-card-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <CardHeader 
        ticker={ticker} setTicker={setTicker} companyMetadata={metadata}
        onDelete={() => onDelete(id)} onEdit={() => {}} 
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        isFullscreen={isFullscreen} widgetId={id}
        activePeriod={activePeriod} setActivePeriod={setActivePeriod}
      />
      <div className="card-body"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Graph Name={ticker} widgetId={id} config={{ chartType: widgetConfig.tipo_grafico }} 
          onMetadataLoaded={setMetadata} period={activePeriod} />
      </div>
    </div>
  );

  if (!isFullscreen) return cardContent;

  return (
    <>
      <div className="ghost-card-placeholder"></div>
      {createPortal(
        <div className="fullscreen-overlay" onClick={() => setIsFullscreen(false)}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            {cardContent}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default DashboardCard;