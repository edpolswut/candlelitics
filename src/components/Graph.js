import React, { useState } from 'react';
import Chart from 'react-apexcharts';

const CandlestickChart = () => {
  // Configurações visuais e de comportamento do gráfico
  const [options] = useState({
    chart: {
      type: 'candlestick',
      height: 'auto',
      width: '100%',
      toolbar: {
        show: true // Mostra as opções de zoom e download
      }
    },
    title: {
      text: 'Variação da Ação X',
      align: 'left'
    },
    xaxis: {
      type: 'datetime' // Crucial para gráficos financeiros
    },
    yaxis: {
      tooltip: {
        enabled: true
      }
    }
  });

  // Dados reais (Série)
  const [series] = useState([{
    name: 'Preço',
    data: [
      {
        x: new Date('2026-05-01').getTime(),
        y: [150.00, 155.00, 148.50, 152.00] // [Open, High, Low, Close]
      },
      {
        x: new Date('2026-05-02').getTime(),
        y: [152.00, 154.00, 149.00, 150.50]
      },
      {
        x: new Date('2026-05-03').getTime(),
        y: [150.50, 158.00, 150.00, 156.00]
      },
      {
        x: new Date('2026-05-04').getTime(),
        y: [156.00, 157.50, 154.00, 155.20]
      },
      {
        x: new Date('2026-05-05').getTime(),
        y: [155.20, 160.00, 155.00, 159.80]
      }
    ]
  }]);

  return (
    <>
      <Chart 
        options={options} 
        series={series} 
        type="candlestick" 
        height={'auto'} 
        width={'100%'}
      />
    </>
  );
};

export default CandlestickChart;