import React, { useState } from 'react';
import './CreateDashboardModal.css';

const CreateDashboardModal = ({ isOpen, onClose, onConfirm }) => {
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Criar Novo Dashboard</h2>
        
        <div className="form-group">
          <label>Código da Ação:</label>
          <input
            type="text"
            name="stockCode"
            placeholder="Ex: AAPL, PETR4, BTC"
            value={config.stockCode}
            onChange={handleChange}
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

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={handleConfirm}>Criar Dashboard</button>
        </div>
      </div>
    </div>
  );
};

export default CreateDashboardModal;