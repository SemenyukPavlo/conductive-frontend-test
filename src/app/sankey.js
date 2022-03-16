import React from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const SankeyNode = ({ id, x0, x1, y0, y1, color, nodeMouseMove, nodeMouseLeave }) => (
  <g>
    <rect
      x={x0}
      y={y0}
      width={x1 - x0}
      height={y1 - y0}
      fill={color}
      onMouseMove={(e) => nodeMouseMove?.(e, id)}
      onMouseLeave={(e) => nodeMouseLeave?.(e)}
    >
    </rect>
    <text
      textAnchor={x1 !== 1000 ? 'start' : 'end'}
      x={x1 !== 1000 ? (x0 + 25) : 975}
      y={y0 + (y1 - y0) / 2}
    >
        {id}
      </text>
  </g>
);

const SankeyLink = ({ link, color, linkMouseMove, linkMouseLeave }) => (
  <path
    onMouseMove={(e) => linkMouseMove?.(e, link)}
    onMouseLeave={(e) => linkMouseLeave?.(e)}
    d={sankeyLinkHorizontal()(link)}
    style={{
      fill: 'none',
      strokeOpacity: 0.25,
      stroke: color,
      strokeWidth: Math.max(1, link.width)
    }}
  />
);

const Sankey = ({ data, width, height, nodeMouseMove, nodeMouseLeave, linkMouseMove, linkMouseLeave }) => {
  const { nodes, links } = sankey()
    .nodeId(i => i.id)
    .nodeWidth(15)
    .nodePadding(15)
    .size([width, height])(data);

  return (
    <g>
      {nodes.map((node) => (
        <SankeyNode
          {...node}
          color={node.color || '#000'}
          id={node.id}
          key={node.id}
          nodeMouseLeave={nodeMouseLeave}
          nodeMouseMove={nodeMouseMove}
        />
      ))}
      {links.map((link, i) => (
        <SankeyLink
          key={i}
          link={link}
          color={link.color || '#000'}
          linkMouseMove={linkMouseMove}
          linkMouseLeave={linkMouseLeave}
        />
      ))}
    </g>
  );
};

export default Sankey;
