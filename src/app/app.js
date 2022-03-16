import React, { useRef, useState, useEffect } from 'react';
import { getSankeyData, totalQuantity } from './tools'
import Sankey from './sankey';

export const App = () => {
  const tooltipRef = useRef();
  const [data, setData] = useState();
  const [tooltip, setTooltip] = useState('');

  useEffect(() => {
    getSankeyData('data.csv').then(setData);
  }, []);

  const nodeMouseMove = (event, id) => {
    event.stopPropagation();

    tooltipRef.current.style.display = 'block';
    tooltipRef.current.style.top = `${event.clientY}px`;
    tooltipRef.current.style.left = `${event.clientX}px`;

    const arr = data.links.filter(l => {
      if (id === 'Polkastarter') return l.source.id === id;

      return l.target.id === id;
    });

    setTooltip(`Total: ${arr.reduce((sum, i) => sum += i.value, 0)}`)
  }

  const linkMouseMove = (event, link) => {
    event.stopPropagation();

    tooltipRef.current.style.display = 'block';
    tooltipRef.current.style.top = `${event.clientY}px`;
    tooltipRef.current.style.left = `${event.clientX}px`;

    setTooltip(`${link.source.id} => ${link.target.id}, Value: ${link.value}`)
  }

  const mouseLeave = (event) => {
    event.stopPropagation();

    tooltipRef.current.style.display = 'none';

    setTooltip('');
  }

  if (!data) return <></>;

  return (
    <div style={{ position: 'relative' }}>
      <div ref={tooltipRef} className='tooltip' style={{ position: 'absolute', background: '#fff', padding: '10px', display: 'none', border: '1px solid black' }}>{tooltip}</div>

      <div><b>Total Value QUIDD:</b> {totalQuantity(data.transactions)}</div>
      <div><b>Total number of transactions:</b> {data.transactions.length}</div>

      <svg width="1000" height="500">
        <Sankey
          nodeMouseMove={nodeMouseMove}
          linkMouseMove={linkMouseMove}
          nodeMouseLeave={mouseLeave}
          linkMouseLeave={mouseLeave}
          data={data}
          width={1000}
          height={500}
        />
      </svg>
    </div>
  );
};

export default App;
