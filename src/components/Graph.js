import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { getQuoteData } from '../services/api';

const Graph = ({ Name = 'PETR4', config = {}, onMetadataLoaded, widgetId, period = '1M', refreshTrigger = 0 }) => {
  const { chartType = 'candlestick', assetType = 'stock' } = config;
  
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('BRL');
  
  const [logoUrl, setLogoUrl] = useState(null);
  const [stockName, setStockName] = useState(Name);
  const [isCrypto, setIsCrypto] = useState(false);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setError(null);
        
        // SÓ MOSTRA O LOADING SE FOR O PRIMEIRO CARREGAMENTO
        // Isso evita que o gráfico pisque a cada minuto
        if (rawData.length === 0) {
          setLoading(true);
        }
        
        let range = '1mo';
        let interval = '1d';
        
        if (period === '1D') { 
          range = '1d'; interval = '15m';
        } else if (period === '1S') { 
          range = '5d'; interval = '1h';
        } else if (period === '1M') { 
          range = '1mo'; interval = '1d';
        } else if (period === '1A') { 
          range = '1y'; interval = '1d';
        }

        const stock = await getQuoteData(Name, range, interval, assetType);
        
        setCurrency(stock.currency || 'BRL');
        setLogoUrl(stock.logourl);
        setStockName(stock.longName || stock.shortName || Name);
        
        // Detecta se é cripto (não tem .SA e a moeda é USD geralmente)
        const isCryptoAsset = !Name.includes('.SA') && Name.length <= 5 && stock.currency === 'USD';
        setIsCrypto(isCryptoAsset);
        
        if (onMetadataLoaded) {
          onMetadataLoaded({
            name: stock.longName || stock.shortName || Name,
            logo: stock.logourl
          });
        }
        
        if (stock.historicalDataPrice && stock.historicalDataPrice.length > 0) {
          const chartData = stock.historicalDataPrice
          .map(item => {
            const dateObj = new Date(item.date * 1000);
            let dateLabel = '';
            
            if (period === '1D') {
              dateLabel = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            } else if (period === '1S') {
              dateLabel = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
            } else if (period === '1M') {
              dateLabel = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            } else {
              dateLabel = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
            }

            return {
              x: dateLabel,
              y: [
                parseFloat(item.open?.toFixed(2) || 0),
                parseFloat(item.high?.toFixed(2) || 0),
                parseFloat(item.low?.toFixed(2) || 0),
                parseFloat(item.close?.toFixed(2) || 0)
              ]
            };
          });
          setRawData(chartData);
        } else {
          setRawData([]); 
        }
        
      } catch (err) {
        setError(err.error || 'Ativo não encontrado ou erro na busca.');
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    if (Name) {
      fetchStockData();
    }
  }, [Name, onMetadataLoaded, period, assetType, refreshTrigger]);

  const series = useMemo(() => {
    if (!rawData || rawData.length === 0) return [{ name: 'Preço', data: [] }];

    const formattedData = rawData.map(item => {
      if (chartType === 'candlestick') {
        return { x: item.x, y: item.y }; 
      } else {
        return { x: item.x, y: item.y[3] }; 
      }
    });

    return [{ name: 'Preço', data: formattedData }];
  }, [rawData, chartType]);

  // Cores padrões fixas
  const UP_COLOR = '#00b746';
  const DOWN_COLOR = '#ef403c';

  // Configurações dinâmicas baseadas no tipo de gráfico
  const getChartOptions = () => {
    const baseOptions = {
      chart: {
        id: widgetId,
        type: chartType,
        height: 'auto',
        width: '100%',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: true,
          type: 'xy'
        },
        // Adicionamos animações suaves para a atualização dos dados
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 1000
          }
        }
      },
      xaxis: {
        type: 'category',
        tickAmount: 6,
        tickPlacement: 'on',
        axisBorder: {
          show: true,
          color: '#ddd'
        },
        axisTicks: {
          show: true,
          color: '#ddd'
        },
        labels: {
          style: {
            colors: '#666'
          }
        }
      },
      yaxis: {
        title: {
          text: `Preço (${currency})`,
          style: {
            color: '#2c3e50'
          }
        },
        labels: {
          style: {
            colors: '#666'
          }
        },
        tooltip: {
          enabled: true
        }
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: UP_COLOR,
            downward: DOWN_COLOR
          }
        },
        line: {
          colors: [UP_COLOR]
        },
        area: {
          colors: [UP_COLOR]
        },
        bar: {
          colors: [UP_COLOR]
        }
      },
      grid: {
        show: true,
        borderColor: '#e8ecf1',
        xaxis: {
          lines: {
            show: true,
            color: '#e8ecf1'
          }
        },
        yaxis: {
          lines: {
            show: true,
            color: '#e8ecf1'
          }
        }
      },
      stroke: {
        colors: [UP_COLOR]
      },
      fill: {
        colors: [UP_COLOR],
        opacity: 0.3
      },
      states: {
        hover: {
          filter: {
            type: 'none'
          }
        }
      }
    };

    return baseOptions;
  };

  const options = useMemo(() => getChartOptions(), [chartType, currency]);

  return (
    <div className="graph-container" style={{ height: '100%', width: '100%', position: 'relative' }}>
      
      {/* Mostra o loading apenas se não houver dados e estiver carregando */}
      {loading && rawData.length === 0 && (
        <p style={{ textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Carregando dados...
        </p>
      )}
      
      {/* Mostra o erro e Oculta o gráfico */}
      {error && (
        <div style={{ textAlign: 'center', color: '#ff4d4f', padding: '16px', fontSize: '12px' }}>
          <p><strong>Erro ao carregar o ativo.</strong></p><p>{error}</p>
        </div>
      )}
      
      {/* Mostra o gráfico contanto que não tenha erro e que já existam dados para mostrar */}
      {!error && rawData.length > 0 && (
        <Chart 
          options={options} 
          series={series} 
          type={chartType} 
          height="100%" 
          width="100%" 
        />
      )}
      
    </div>
  );
};

export default Graph;