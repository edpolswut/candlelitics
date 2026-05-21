import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';

// 1. Adicionamos a prop onMetadataLoaded aqui
const Graph = ({ Name = 'PETR4', config = {}, onMetadataLoaded, widgetId, period = '1M' }) => {
  const chartType = config.chartType || 'candlestick';
  
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('BRL');
  
  // Esses estados locais (logoUrl, stockName) deixaram de ser estritamente necessários 
  // para renderização aqui dentro, mas mantivemos para manter a sua lógica intacta.
  const [logoUrl, setLogoUrl] = useState(null);
  const [stockName, setStockName] = useState(Name);
  
  const API_KEY = 'ie2zCfzxZAY3SysfiKnZM9';

  // Fetch de dados da Brapi API
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        
        // 1. Mapeamento do Período (Botão -> Brapi)
        let range = '1mo';
        let interval = '1d';
        
        if (period === '1D') { 
          range = '1d'; interval = '15m'; // Último dia, dados a cada 15 min
        } else if (period === '1S') { 
          range = '5d'; interval = '1h';  // 1 Semana (5 dias úteis), dados a cada 1 hora
        } else if (period === '1M') { 
          range = '1mo'; interval = '1d'; // 1 Mês, dados diários
        } else if (period === '1A') { 
          range = '1y'; interval = '1d';  // 1 Ano, dados diários
        }

        const stockCode = Name.includes('.') ? Name : `${Name}.SA`;
        
        // 2. URL com os parâmetros históricos
        const url = `https://brapi.dev/api/quote/${stockCode}?range=${range}&interval=${interval}&token=${API_KEY}`;
        console.log('Fazendo fetch real para:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results[0]) {
          const stock = data.results[0];
          
          setCurrency(stock.currency || 'BRL');
          setLogoUrl(stock.logourl);
          setStockName(stock.longName || Name);
          
          if (onMetadataLoaded) {
            onMetadataLoaded({
              name: stock.longName || stock.shortName || Name,
              logo: stock.logourl
            });
          }
          
          // 3. Processamento dos dados reais
          if (stock.historicalDataPrice && stock.historicalDataPrice.length > 0) {
            const chartData = stock.historicalDataPrice.map(item => {
              const dateObj = new Date(item.date * 1000);
              let dateLabel = '';
              
              // Formata a data dependendo do período escolhido para não poluir o eixo X
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
                x: dateLabel, // A mágica: passamos a string formatada em vez do timestamp
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
            // Caso a ação seja muito recente ou não tenha dados no período
            setRawData([]); 
          }
          
          setError(null);
        } else {
          throw new Error('Resposta da API inválida');
        }
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    if (Name) {
      fetchStockData();
    }
  }, [Name, onMetadataLoaded, period]);

  const series = useMemo(() => {
    if (!rawData || rawData.length === 0) return [{ name: 'Preço', data: [] }];

    const formattedData = rawData.map(item => {
      if (chartType === 'candlestick') {
        // Vela precisa dos 4 valores: [Open, High, Low, Close]
        return { x: item.x, y: item.y }; 
      } else {
        // Linha/Área precisa de apenas 1 valor. Vamos usar o Close (índice 3 do array)
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
        }
      },
      // 3. O BLOCO DE TITLE FOI TOTALMENTE REMOVIDO DAQUI
      xaxis: {
        type: 'category', // Adeus buracos! Agora as velas ficam coladas umas nas outras.
        tickAmount: 6,    // Limita a exibição a 6 rótulos no eixo X para não encavalar
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

  const options = useMemo(() => getChartOptions(), [chartType, currency]); // Removido 'Name' das dependências pois não é mais usado no gráfico

  return (
    <div className="graph-container" style={{ height: '100%', width: '100%' }}>
      {loading && <p style={{ textAlign: 'center' }}>Carregando dados...</p>}
      {error && <p style={{ textAlign: 'center', color: 'red' }}>Erro: {error}</p>}
      
      {!loading && !error && (
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