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
  const [touchHeldNode, setTouchHeldNode] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<SVGSVGElement>(null);
  const animationsRef = useRef<{ [key: number]: gsap.core.Tween | null }>({});
  const dragStartRef = useRef<{ x: number; y: number; nodeX: number; nodeY: number } | null>(null);
  const touchHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Start random animation for a node from its current position
  const startNodeAnimation = useCallback((node: HTMLDivElement, index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const padding = isMobile ? 20 : 80;
    const nodeSize = isMobile ? 96 : 144;

    const animateNode = () => {
      // Get current position to animate FROM
      const currentX = gsap.getProperty(node, 'x') as number;
      const currentY = gsap.getProperty(node, 'y') as number;
      const currentScale = gsap.getProperty(node, 'scale') as number || 1;
      
      const maxX = containerRect.width - padding - nodeSize;
      const maxY = containerRect.height - padding - nodeSize;
      
      const newX = padding + Math.random() * Math.max(maxX - padding, 50);
      const newY = padding + Math.random() * Math.max(maxY - padding, 50);
      const newScale = isMobile ? 0.9 + Math.random() * 0.2 : 0.8 + Math.random() * 0.5;
      const duration = isMobile ? 10 + Math.random() * 5 : 8 + Math.random() * 6;

      animationsRef.current[index] = gsap.fromTo(node, 
        { x: currentX, y: currentY, scale: currentScale },
        {
          x: newX,
          y: newY,
          scale: newScale,
          duration: duration,
          ease: 'sine.inOut',
          onComplete: animateNode,
        }
      );
    };

    animateNode();
  }, []);

  // Handle mouse/touch down on a bubble
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const node = nodesRef.current[index];
    if (!node) return;

    // Kill the current animation for this node only
    if (animationsRef.current[index]) {
      animationsRef.current[index]?.kill();
      animationsRef.current[index] = null;
    }

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
    
    // Prevent scrolling on touch devices
    e.preventDefault();
    
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
    const nodeIndex = draggedNode;
    
    // Clear drag state first
    setDraggedNode(null);
    dragStartRef.current = null;
    
    // Resume animation after a delay, starting from where it was dropped
    if (node) {
      setTimeout(() => {
        startNodeAnimation(node, nodeIndex);
      }, 1500);
    }
  }, [draggedNode, startNodeAnimation]);

  // Set up global mouse/touch listeners for drag
  useEffect(() => {
    if (draggedNode !== null) {
      // Use passive: false to allow preventDefault on touch events
      const options = { passive: false };
      
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, options);
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
    // Smaller padding on mobile
    const isMobile = window.innerWidth < 768;
    const padding = isMobile ? 20 : 80;

    // Animate each node with random movement and size changes
    nodesRef.current.forEach((node, index) => {
      if (!node) return;

      // Distribute nodes more evenly across the container
      const cols = isMobile ? 2 : 4;
      const rows = Math.ceil(nodes.length / cols);
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const cellWidth = (containerRect.width - padding * 2) / cols;
      const cellHeight = (containerRect.height - padding * 2) / rows;
      
      const startX = padding + col * cellWidth + (Math.random() * 0.5) * cellWidth;
      const startY = padding + row * cellHeight + (Math.random() * 0.5) * cellHeight;
      
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
        <p className="mt-4 text-xs font-mono tracking-widest uppercase text-[#86868B] flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-px bg-[#86868B]" />
          Drag to interact
          <span className="inline-block w-4 h-px bg-[#86868B]" />
        </p>
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
              onTouchStart={(e) => {
                // Clear any previous timer
                if (touchHoldTimerRef.current) {
                  clearTimeout(touchHoldTimerRef.current);
                }
                // Show tooltip after short hold
                touchHoldTimerRef.current = setTimeout(() => {
                  setTouchHeldNode(index);
                }, 200);
                handleDragStart(e, index);
              }}
              onTouchEnd={() => {
                if (touchHoldTimerRef.current) {
                  clearTimeout(touchHoldTimerRef.current);
                }
                setTouchHeldNode(null);
              }}
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

              {/* Tooltip on Hover/Touch - Thin line with floating text, top-right of bubble */}
              <div
                className={`
                  absolute left-full top-0 -translate-y-1/2 ml-4 z-[100]
                  flex items-start gap-0
                  transition-all duration-300 ease-out pointer-events-none
                  ${(hoveredNode === node.id && draggedNode === null) || touchHeldNode === index || draggedNode === index 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-2'}
                `}
              >
                {/* Thin connecting line with gap */}
                <div className="w-10 h-px bg-[#1D1D1F] mt-3 mr-4" />
                
                {/* Text content */}
                <div className="text-left">
                  <div className="text-sm font-bold text-[#1D1D1F] tracking-wide uppercase mb-1">
                    {node.proficiency}
                  </div>
                  <div className="text-base text-[#6E6E73] font-normal leading-snug max-w-[220px]">
                    {node.evidence}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-12 lg:px-24 py-12 bg-[#FAFAFA] border-t border-[#E5E5E5]">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white p-6 md:p-8 border border-[#E5E5E5] text-center">
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
