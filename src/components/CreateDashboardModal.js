import React, { useState } from 'react';
import './CreateDashboardModal.css';

const CreateDashboardModal = ({ isOpen, onClose, onConfirm, isDarkTheme }) => {
  const [config, setConfig] = useState({
    stockCode: '',
    chartType: 'candlestick'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    if (!config.stockCode.trim()) {
      alert("Por favor, digite o código de uma ação (ex: PETR4).");
      return;
    }
    onConfirm(config); 
    setConfig({ stockCode: '', chartType: 'candlestick' }); 
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        data-theme={isDarkTheme ? 'dark' : 'light'} 
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-chart-line"></i> Criar Novo Dashboard
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Código da Ação:</label>
            <input
              type="text"
              name="stockCode"
              className="form-input"
              placeholder="Ex: AAPL, PETR4, BTC"
              value={config.stockCode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Gráfico:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="chartType"
                  value="candlestick"
                  checked={config.chartType === 'candlestick'}
                  onChange={handleChange}
                /> Candlestick
              </label>
              <label>
                <input
                  type="radio"
                  name="chartType"
                  value="line"
                  checked={config.chartType === 'line'}
                  onChange={handleChange}
                /> Linha
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={handleConfirm}>Criar Dashboard</button>
        </div>
      </div>
    </div>
  );
};

export default CreateDashboardModal;