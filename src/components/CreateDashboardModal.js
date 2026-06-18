import React, { useState, useEffect } from 'react';
import './CreateDashboardModal.css';
import { toast } from 'react-toastify';
import { getAvailableCryptos } from '../services/api';

const CreateDashboardModal = ({ isOpen, onClose, onConfirm, isDarkTheme, isEditing = false, initialConfig }) => {
  const [config, setConfig] = useState({
    stockCode: '',
    chartType: 'candlestick',
    assetType: 'stock',
    color: '#00b746'
  });
  const [availableCryptos, setAvailableCryptos] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Se estiver editando, preenche o formulário com os dados existentes
      if (isEditing && initialConfig) {
        setConfig({
          stockCode: initialConfig.ativos[0] || '',
          chartType: initialConfig.tipo_grafico || 'candlestick',
          assetType: initialConfig.tipo_ativo || 'stock',
          color: initialConfig.cor || '#00b746'
        });
      }

      getAvailableCryptos()
        .then(coins => {
          setAvailableCryptos(coins);
        });
    }
  }, [isOpen, isEditing]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setConfig(prev => {
      const newConfig = { ...prev, [name]: value };
      if (name === 'assetType' && value === 'crypto') {
        newConfig.stockCode = '';
      }
      return newConfig;
    });
  };

  const handleConfirm = () => {
    if (!config.stockCode.trim()) {
      const tipoAtivo = config.assetType === 'stock' ? 'ação' : 'cripto';
      toast.error(`Por favor, digite o código de uma ${tipoAtivo} (ex: ${config.assetType === 'stock' ? 'PETR4' : 'BTC'}).`);
      return;
    }

    onConfirm(config);

    if (!isEditing) {
      setConfig({
        stockCode: '',
        chartType: 'candlestick',
        assetType: 'stock'
      });
      toast.success('Dashboard criado com sucesso!');
    }

    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}>
      <div
        className="modal-content"
        data-theme={isDarkTheme ? 'dark' : 'light'}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="modal-header">
          <h2>
            <i className={`fas ${isEditing ? 'fa-edit' : 'fa-chart-line'}`}></i> {isEditing ? 'Editar Card' : 'Criar Novo Dashboard'}
          </h2>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">

          <div className="form-group">
            <label>Tipo de Ativo:</label>

            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="assetType"
                  value="stock"
                  checked={config.assetType === 'stock'}
                  onChange={handleChange}
                />
                Ação
              </label>

              <label>
                <input
                  type="radio"
                  name="assetType"
                  value="crypto"
                  checked={config.assetType === 'crypto'}
                  onChange={handleChange}
                />
                Cripto
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>{config.assetType === 'stock' ? 'Código da Ação:' : 'Código da Cripto:'}</label>
            
            {config.assetType === 'stock' ? (
              <input
                type="text"
                name="stockCode"
                className="form-input"
                placeholder={'Ex: AAPL, PETR4'}
                value={config.stockCode}
                onChange={handleChange}
              />
            ) : (
              <select
                name="stockCode"
                className="form-input"
                value={config.stockCode}
                onChange={handleChange}
                size={5}
              >
                <option value="" disabled>Selecione uma cripto...</option>
                {availableCryptos.length === 0 && <option value="">Carregando...</option>}
                
                {availableCryptos.map(coin => (
                  <option key={coin} value={coin}>{coin}</option>
                ))}
              </select>
            )}
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
                />
                Candlestick
              </label>

              <label>
                <input
                  type="radio"
                  name="chartType"
                  value="line"
                  checked={config.chartType === 'line'}
                  onChange={handleChange}
                />
                Linha
              </label>

              {/* <label>
                <input 
                  type="radio" 
                  name="chartType" 
                  value="area" 
                  checked={config.chartType === 'area'} 
                  onChange={handleChange} 
                />
                Área
              </label>

              <label>
                <input 
                  type="radio" 
                  name="chartType" 
                  value="bar" 
                  checked={config.chartType === 'bar'} 
                  onChange={handleChange} 
                />
                Barra
              </label> */}

            </div>
          </div>

          <div className="form-group">
            <label>Cor Principal do Gráfico:</label>
            <input
              type="color"
              name="color"
              className="form-input"
              style={{ padding: '0', height: '40px', cursor: 'pointer' }}
              value={config.color}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="modal-footer">

          <button
            className="btn-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="btn-confirm"
            onClick={handleConfirm}
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Dashboard'}
          </button>

        </div>

      </div>
    </div>
  );
};

export default CreateDashboardModal;
