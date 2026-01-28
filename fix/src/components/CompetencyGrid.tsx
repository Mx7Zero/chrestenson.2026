import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface BubbleNode {
  id: number;
  domain: string;
  proficiency: string;
  evidence: string;
}

export const CompetencyGrid = () => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [draggedNode, setDraggedNode] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<SVGSVGElement>(null);
  const animationsRef = useRef<{ [key: number]: gsap.core.Tween | null }>({});
  const dragStartRef = useRef<{ x: number; y: number; nodeX: number; nodeY: number } | null>(null);

  const nodes: BubbleNode[] = [
    { id: 0, domain: 'Brand Development', proficiency: 'Expert', evidence: 'Six hospitality brands built from concept to exit' },
    { id: 1, domain: 'Corporate Strategy', proficiency: 'Expert', evidence: 'VUCA framework, category creation, exit architecture' },
    { id: 2, domain: 'Patent/IP Strategy', proficiency: 'Expert', evidence: 'Multi-patent portfolios, FTO compliance, valuation' },
    { id: 3, domain: 'Finance Modeling', proficiency: 'Expert', evidence: 'Investment memoranda, ROI analysis, capital deployment' },
    { id: 4, domain: 'Product Architecture', proficiency: 'Expert', evidence: 'Hardware-software platforms, metric development' },
    { id: 5, domain: 'Technical Development', proficiency: 'Expert', evidence: 'React/TypeScript, PostgreSQL, full-stack SaaS' },
    { id: 6, domain: 'Hospitality Development', proficiency: 'Expert', evidence: 'Concept-to-exit execution: R&D, ABC, permitting' },
    { id: 7, domain: 'Market Analysis', proficiency: 'Expert', evidence: 'Multi-segment sizing, competitive landscape' },
  ];

  const metrics = [
    { value: '$180M–$450M', label: 'IP Portfolio Valuation' },
    { value: '6 Ventures', label: 'Built & Sold to Exit' },
    { value: '160x ROI', label: 'Demonstrated Returns' },
  ];

  // Start random animation for a node
  const startNodeAnimation = useCallback((node: HTMLDivElement, index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const padding = 100;

    const animateNode = () => {
      if (draggedNode === index) return; // Don't animate while dragging
      
      const newX = padding + Math.random() * (containerRect.width - padding * 2 - 150);
      const newY = padding + Math.random() * (containerRect.height - padding * 2 - 150);
      const newScale = 0.8 + Math.random() * 0.5;
      const duration = 8 + Math.random() * 6;

      animationsRef.current[index] = gsap.to(node, {
        x: newX,
        y: newY,
        scale: newScale,
        duration: duration,
        ease: 'sine.inOut',
        onComplete: animateNode,
      });
    };

    animateNode();
  }, [draggedNode]);

  // Handle mouse/touch down on a bubble
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    e.preventDefault();
    const node = nodesRef.current[index];
    if (!node) return;

    // Kill the current animation
    if (animationsRef.current[index]) {
      animationsRef.current[index]?.kill();
    }
    gsap.killTweensOf(node);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Get current position from GSAP
    const currentX = gsap.getProperty(node, 'x') as number;
    const currentY = gsap.getProperty(node, 'y') as number;

    dragStartRef.current = {
      x: clientX,
      y: clientY,
      nodeX: currentX,
      nodeY: currentY,
    };

    setDraggedNode(index);
    setHoveredNode(null);
  };

  // Handle mouse/touch move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (draggedNode === null || !dragStartRef.current) return;
    
    const node = nodesRef.current[draggedNode];
    if (!node) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    gsap.set(node, {
      x: dragStartRef.current.nodeX + deltaX,
      y: dragStartRef.current.nodeY + deltaY,
    });
  }, [draggedNode]);

  // Handle mouse/touch up
  const handleDragEnd = useCallback(() => {
    if (draggedNode === null) return;
    
    const node = nodesRef.current[draggedNode];
    if (node) {
      // Resume animation after a short delay
      gsap.delayedCall(0.5, () => {
        startNodeAnimation(node, draggedNode);
      });
    }

    setDraggedNode(null);
    dragStartRef.current = null;
  }, [draggedNode, startNodeAnimation]);

  // Set up global mouse/touch listeners for drag
  useEffect(() => {
    if (draggedNode !== null) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [draggedNode, handleDragMove, handleDragEnd]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const padding = 100;

    // Animate each node with random movement and size changes
    nodesRef.current.forEach((node, index) => {
      if (!node) return;

      // Random starting position
      const startX = padding + Math.random() * (containerRect.width - padding * 2 - 150);
      const startY = padding + Math.random() * (containerRect.height - padding * 2 - 150);
      
      gsap.set(node, { x: startX, y: startY });

      // Stagger start
      gsap.delayedCall(index * 0.5, () => startNodeAnimation(node, index));
    });

    // Update connection lines on animation frame
    const updateLines = () => {
      if (!linesRef.current) return;
      
      const paths = linesRef.current.querySelectorAll('path');
      paths.forEach((path, index) => {
        if (index >= nodes.length - 1) return;
        
        const fromNode = nodesRef.current[index];
        const toNode = nodesRef.current[index + 1];
        
        if (fromNode && toNode) {
          const fromRect = fromNode.getBoundingClientRect();
          const toRect = toNode.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
          const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
          const toX = toRect.left + toRect.width / 2 - containerRect.left;
          const toY = toRect.top + toRect.height / 2 - containerRect.top;
          
          path.setAttribute('d', `M ${fromX} ${fromY} L ${toX} ${toY}`);
        }
      });
      
      requestAnimationFrame(updateLines);
    };
    
    const frameId = requestAnimationFrame(updateLines);

    return () => {
      cancelAnimationFrame(frameId);
      nodesRef.current.forEach((_, index) => {
        if (animationsRef.current[index]) {
          animationsRef.current[index]?.kill();
        }
      });
      gsap.killTweensOf(nodesRef.current);
    };
  }, [startNodeAnimation]);

  return (
    <section id="about" className="py-16 bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-8 text-center px-6">
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
      </div>

      {/* Bubble Network - Full Width */}
      <div 
        ref={containerRef}
        className="relative w-full flex-1 min-h-[600px] md:min-h-[700px] lg:min-h-[800px] overflow-hidden"
      >
          {/* Connection Lines SVG */}
          <svg 
            ref={linesRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {nodes.slice(0, -1).map((_, index) => (
              <path
                key={`line-${index}`}
                d="M 0 0 L 0 0"
                stroke={hoveredNode === index || hoveredNode === index + 1 ? '#0071E3' : '#D1D1D6'}
                strokeWidth="2"
                fill="none"
                className="transition-colors duration-300"
              />
            ))}
          </svg>

          {/* Bubble Nodes */}
          {nodes.map((node, index) => (
            <div
              key={node.id}
              ref={el => { nodesRef.current[index] = el; }}
              className={`absolute group select-none ${draggedNode === index ? 'cursor-grabbing z-50' : 'cursor-grab'}`}
              style={{ willChange: 'transform', touchAction: 'none' }}
              onMouseEnter={() => draggedNode === null && setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onMouseDown={(e) => handleDragStart(e, index)}
              onTouchStart={(e) => handleDragStart(e, index)}
            >
              {/* Main Bubble */}
              <div
                className={`
                  rounded-full bg-[#1D1D1F] flex items-center justify-center text-center
                  transition-all duration-300 ease-out
                  w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36
                  ${draggedNode === index ? 'bg-[#0071E3] shadow-2xl shadow-[#0071E3]/50 scale-110' : ''}
                  ${hoveredNode === node.id && draggedNode === null ? 'bg-[#0071E3] shadow-2xl shadow-[#0071E3]/40 !scale-125' : 'hover:bg-[#2D2D2F]'}
                `}
              >
                <span className="text-white text-[10px] md:text-xs lg:text-sm font-medium leading-tight px-3 text-center">
                  {node.domain.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </span>
              </div>

              {/* Tooltip on Hover - Sleek floating label */}
              <div
                className={`
                  absolute left-1/2 -translate-x-1/2 top-full mt-6 z-50
                  backdrop-blur-xl bg-black/80 rounded-full px-5 py-2.5
                  whitespace-nowrap
                  transition-all duration-300 ease-out pointer-events-none
                  ${hoveredNode === node.id && draggedNode === null 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-1 scale-95'}
                `}
              >
                <span className="text-[11px] text-white/60 uppercase tracking-[0.2em] mr-2">
                  {node.proficiency}
                </span>
                <span className="text-[13px] text-white font-light">
                  {node.evidence}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-12 lg:px-24 py-12 bg-[#FAFAFA] border-t border-[#E5E5E5]">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl p-6 md:p-8 border border-[#E5E5E5] text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#0071E3] mb-1 font-mono tracking-tight">
                {metric.value}
              </div>
              <div className="text-sm md:text-base text-[#6E6E73] tracking-wide">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
    </section>
  );
};
