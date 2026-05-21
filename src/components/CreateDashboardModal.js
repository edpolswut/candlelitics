import React, { useState } from 'react';
import './CreateDashboardModal.css';

function CreateDashboardModal({ isOpen, onClose, onConfirm }) {
  const [config, setConfig] = useState({
    stockCode: '',
    chartType: 'candlestick'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirm = () => {
    if (!config.stockCode.trim()) {
      alert('Por favor, digite um código de ação');
      return;
    }
    onConfirm(config);
    setConfig({
      stockCode: '',
      chartType: 'candlestick'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Criar Novo Dashboard</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Stock Code Input */}
          <div className="form-group">
            <label htmlFor="stockCode">
              <span className="label-icon">📈</span>
              Código da Ação
            </label>
            <input
              type="text"
              id="stockCode"
              name="stockCode"
              placeholder="Ex: PETR4, VALE3, ITUB4"
              value={config.stockCode}
              onChange={handleChange}
              className="form-input"
              autoFocus
            />
          </div>

          {/* Chart Type */}
          <div className="form-group">
            <label htmlFor="chartType">
              <span className="label-icon">📊</span>
              Tipo de Gráfico
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="chartType"
                  value="candlestick"
                  checked={config.chartType === 'candlestick'}
                  onChange={handleChange}
                />
                <span>Candlestick (Velas)</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="chartType"
                  value="line"
                  checked={config.chartType === 'line'}
                  onChange={handleChange}
                />
                <span>Linha</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="chartType"
                  value="area"
                  checked={config.chartType === 'area'}
                  onChange={handleChange}
                />
                <span>Área</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="chartType"
                  value="bar"
                  checked={config.chartType === 'bar'}
                  onChange={handleChange}
                />
                <span>Barras</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="preview-section">
            <h3>Resumo</h3>
            <div className="preview-content">
              <p><strong>Ação:</strong> {config.stockCode || '—'}</p>
              <p><strong>Gráfico:</strong> {config.chartType}</p>
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
}

export default CreateDashboardModal;
