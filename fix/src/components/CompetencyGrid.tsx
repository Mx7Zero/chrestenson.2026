import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface BubbleNode {
  id: number;
  domain: string;
  proficiency: string;
  evidence: string;
  x: number;
  y: number;
  size: number;
  connections: number[];
}

export const CompetencyGrid = () => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);

  // Node data with positions (percentage-based for responsiveness)
  const nodes: BubbleNode[] = [
    { id: 0, domain: 'Brand Development', proficiency: 'Expert', evidence: 'Six hospitality brands built from concept to exit', x: 35, y: 8, size: 140, connections: [1, 2] },
    { id: 1, domain: 'Corporate Strategy', proficiency: 'Expert', evidence: 'VUCA framework, category creation, exit architecture', x: 15, y: 35, size: 120, connections: [0, 3] },
    { id: 2, domain: 'Patent/IP Strategy', proficiency: 'Expert', evidence: 'Multi-patent portfolios, FTO compliance, valuation', x: 50, y: 32, size: 100, connections: [0, 3, 4] },
    { id: 3, domain: 'Finance Modeling', proficiency: 'Expert', evidence: 'Investment memoranda, ROI analysis, capital deployment', x: 32, y: 58, size: 110, connections: [1, 2, 5] },
    { id: 4, domain: 'Product Architecture', proficiency: 'Expert', evidence: 'Hardware-software platforms, metric development', x: 70, y: 42, size: 105, connections: [2, 5] },
    { id: 5, domain: 'Technical Development', proficiency: 'Expert', evidence: 'React/TypeScript, PostgreSQL, full-stack SaaS', x: 60, y: 72, size: 115, connections: [3, 4] },
    { id: 6, domain: 'Hospitality Development', proficiency: 'Expert', evidence: 'Concept-to-exit execution: R&D, ABC, permitting', x: 85, y: 18, size: 95, connections: [2] },
    { id: 7, domain: 'Market Analysis', proficiency: 'Expert', evidence: 'Multi-segment sizing, competitive landscape', x: 82, y: 65, size: 90, connections: [4, 5] },
  ];

  // Key Achievements
  const metrics = [
    { value: '$180M–$450M', label: 'IP Portfolio Valuation' },
    { value: '6 Ventures', label: 'Built & Sold to Exit' },
    { value: '160x ROI', label: 'Demonstrated Returns' },
  ];

  useEffect(() => {
    // Subtle floating animation for each node
    nodesRef.current.forEach((node, index) => {
      if (node) {
        gsap.to(node, {
          y: '+=10',
          duration: 2 + (index * 0.3),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }, []);

  // Generate SVG path for connections
  const getConnectionPath = (from: BubbleNode, to: BubbleNode) => {
    const fromX = from.x;
    const fromY = from.y + 8; // offset for header
    const toX = to.x;
    const toY = to.y + 8;
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  };

  return (
    <section id="about" className="py-24 px-6 md:px-12 lg:px-24 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-[#E5E5E5]" />
            <span className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-[#0071E3]">
              Core Competencies
            </span>
            <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-[#E5E5E5]" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1D1D1F]">
            Expert-level execution across eight domains
          </h2>
          <p className="text-[#6E6E73] mt-4">Hover over each node to explore</p>
        </div>

        {/* Bubble Network */}
        <div 
          ref={containerRef}
          className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] mb-16"
        >
          {/* Connection Lines SVG */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {nodes.map(node => 
              node.connections.map(connId => {
                const connectedNode = nodes.find(n => n.id === connId);
                if (connectedNode && node.id < connId) {
                  return (
                    <path
                      key={`${node.id}-${connId}`}
                      d={getConnectionPath(node, connectedNode)}
                      stroke={hoveredNode === node.id || hoveredNode === connId ? '#0071E3' : '#D1D1D6'}
                      strokeWidth="0.3"
                      fill="none"
                      className="transition-all duration-500"
                    />
                  );
                }
                return null;
              })
            )}
          </svg>

          {/* Bubble Nodes */}
          {nodes.map((node, index) => (
            <div
              key={node.id}
              ref={el => { nodesRef.current[index] = el; }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${node.x}%`,
                top: `${node.y + 8}%`,
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Main Bubble */}
              <div
                className={`
                  rounded-full bg-[#1D1D1F] flex items-center justify-center text-center p-4
                  transition-all duration-500 ease-out
                  ${hoveredNode === node.id ? 'scale-110 bg-[#0071E3] shadow-2xl shadow-[#0071E3]/30' : 'hover:bg-[#2D2D2F]'}
                `}
                style={{
                  width: `${node.size * 0.6}px`,
                  height: `${node.size * 0.6}px`,
                }}
              >
                <span className="text-white text-xs md:text-sm font-medium leading-tight px-2">
                  {node.domain}
                </span>
              </div>

              {/* Tooltip on Hover */}
              <div
                className={`
                  absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50
                  bg-white rounded-xl shadow-2xl border border-[#E5E5E5] p-4
                  min-w-[220px] max-w-[280px]
                  transition-all duration-300 pointer-events-none
                  ${hoveredNode === node.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-wider text-[#0071E3] uppercase">
                    {node.proficiency}
                  </span>
                </div>
                <p className="text-sm text-[#424245] leading-relaxed">
                  {node.evidence}
                </p>
                {/* Arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-[#E5E5E5] rotate-45" />
              </div>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-[#FAFAFA] rounded-2xl p-8 border border-[#E5E5E5] text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#0071E3] mb-2">
                {metric.value}
              </div>
              <div className="text-lg text-[#6E6E73]">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
