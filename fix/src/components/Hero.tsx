import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ResumeModal } from './ResumeModal';

// Physics controls interface
interface PhysicsSettings {
  logoSpeed: number;      // 0-200
  letterSpeed: number;    // 0-200
  bounce: number;         // 0-100 (elasticity)
  repulsion: number;      // 0-100
  friction: number;       // 0-100 (higher = more friction)
  gravity: number;        // -50 to 50
}

// Floating letters animation with collision detection - v1.0
export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const lettersContainerRef = useRef<HTMLDivElement>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Physics settings with refs for real-time updates
  const [physics, setPhysics] = useState<PhysicsSettings>({
    logoSpeed: 100,
    letterSpeed: 100,
    bounce: 50,
    repulsion: 50,
    friction: 50,
    gravity: 0
  });
  const physicsRef = useRef(physics);
  physicsRef.current = physics;

  // 2 sets of CHRESTENSON letters for fluid movement
  const letterSet = ['C', 'H', 'R', 'E', 'S', 'T', 'E', 'N', 'S', 'O', 'N'];
  const letters = [...letterSet, ...letterSet];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enable hardware acceleration
      if (logoRef.current) {
        logoRef.current.style.willChange = 'transform';
        logoRef.current.style.transform = 'translateZ(0)';
      }

      // Zero gravity floating animation - active random movement
      let velocityX = gsap.utils.random(-120, 120);
      let velocityY = gsap.utils.random(-120, 120);
      let rotationVelocity = gsap.utils.random(-30, 30); // Good spin
      let currentX = 0;
      let currentY = 0;
      let currentRotation = 0;
      let isDraggingRef = false;
      let animationFrameId: number;
      let lastTime = performance.now();
      
      // Responsive bounds based on screen width
      const getResponsiveBounds = () => {
        const isMobile = window.innerWidth < 768;
        return {
          left: isMobile ? -window.innerWidth * 0.35 : -400,
          right: isMobile ? window.innerWidth * 0.35 : 400,
          top: -120,
          bottom: isMobile ? 60 : 80, // Bounce off top of CHRESTENSON
        };
      };
      
      let bounds = getResponsiveBounds();
      
      // Update bounds on resize
      const handleResize = () => {
        bounds = getResponsiveBounds();
      };
      window.addEventListener('resize', handleResize);
      
      const updateFloat = (currentTime: number) => {
        if (!logoRef.current) {
          animationFrameId = requestAnimationFrame(updateFloat);
          return;
        }

        // Calculate delta time for smooth animation across different frame rates
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
        lastTime = currentTime;

        if (!isDraggingRef) {
          // Update position with delta time
          currentX += velocityX * deltaTime;
          currentY += velocityY * deltaTime;
          currentRotation += rotationVelocity * deltaTime;
          
          // Bounce off boundaries by reversing velocity
          if (currentX <= bounds.left || currentX >= bounds.right) {
            velocityX *= -0.8;
            currentX = currentX <= bounds.left ? bounds.left : bounds.right;
            // Add slight variation on bounce
            velocityY += gsap.utils.random(-5, 5);
            rotationVelocity += gsap.utils.random(-3, 3);
          }
          
          if (currentY <= bounds.top || currentY >= bounds.bottom) {
            velocityY *= -0.8;
            currentY = currentY <= bounds.top ? bounds.top : bounds.bottom;
            // Add slight variation on bounce
            velocityX += gsap.utils.random(-5, 5);
            rotationVelocity += gsap.utils.random(-3, 3);
          }
          
          // Frequent random drift for unpredictable movement
          if (Math.random() < 0.03) {
            velocityX += gsap.utils.random(-15, 15);
            velocityY += gsap.utils.random(-15, 15);
            rotationVelocity += gsap.utils.random(-5, 5);
          }
          
          // Occasional bigger direction change
          if (Math.random() < 0.005) {
            velocityX += gsap.utils.random(-40, 40);
            velocityY += gsap.utils.random(-40, 40);
          }
          
          // Apply transform directly for better performance
          logoRef.current.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentRotation}deg) translateZ(0)`;
        }
        
        animationFrameId = requestAnimationFrame(updateFloat);
      };
      
      // Start animation loop
      animationFrameId = requestAnimationFrame(updateFloat);

      // Floating letters animation
      const letterElements: Array<{
        el: HTMLElement;
        x: number;
        y: number;
        vx: number;
        vy: number;
        rotation: number;
        rotationSpeed: number;
        size: number;
      }> = [];

      // Responsive letter bounds based on screen size
      const isMobile = window.innerWidth < 768;
      const containerWidth = isMobile ? window.innerWidth * 0.9 : 700;
      const containerHeight = isMobile ? 280 : 400;
      const letterBounds = {
        left: -containerWidth / 2 + 20,
        right: containerWidth / 2 - 20,
        top: -containerHeight / 2 + 20,
        bottom: containerHeight / 2 - 40
      };
      
      // Logo collision radius - sized to match the visible logo
      const logoCollisionRadius = isMobile ? 85 : 130;

      if (lettersContainerRef.current) {
        const letterDivs = lettersContainerRef.current.children;
        const size = isMobile ? 14 : 20; // Smaller letters on mobile
        letters.forEach((_, idx) => {
          const el = letterDivs[idx] as HTMLElement;
          if (!el) return;
          // Start letters in a ring OUTSIDE the logo collision zone
          const angle = (idx / letters.length) * Math.PI * 2;
          const radius = gsap.utils.random(logoCollisionRadius + 30, logoCollisionRadius + 80);
          letterElements.push({
            el,
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius * 0.6, // Elliptical
            vx: gsap.utils.random(-80, 80),
            vy: gsap.utils.random(-80, 80),
            rotation: gsap.utils.random(0, 360),
            rotationSpeed: gsap.utils.random(-20, 20),
            size
          });
        });
      }

      const updateLetters = () => {
        const p = physicsRef.current;
        
        // Dynamic physics values from sliders
        const logoRadius = logoCollisionRadius;
        const maxSpeed = 40 + p.letterSpeed * 0.8; // 40-120
        const maxRotationSpeed = 20;
        const frictionFactor = 1 - (p.friction * 0.0002); // 0.98-1.0
        const repulsionForce = p.repulsion * 0.1; // 0-10
        const bounceStrength = p.bounce * 0.02; // 0-2
        const gravityForce = p.gravity * 0.5; // -25 to 25
        
        // Accumulate push force from letters to logo
        let logoPushX = 0;
        let logoPushY = 0;
        let collisionCount = 0;
        
        letterElements.forEach((letter, i) => {
          // Apply friction
          letter.vx *= frictionFactor;
          letter.vy *= frictionFactor;
          letter.rotationSpeed *= frictionFactor;
          
          // Random energy injection based on letter speed setting
          if (Math.random() < 0.02 + p.letterSpeed * 0.0002) {
            const energyAmount = 15 + p.letterSpeed * 0.3;
            letter.vx += gsap.utils.random(-energyAmount, energyAmount);
            letter.vy += gsap.utils.random(-energyAmount, energyAmount);
            letter.rotationSpeed += gsap.utils.random(-5, 5);
          }
          
          // Apply gravity
          letter.vy += gravityForce * 0.016;
          
          // Update position
          letter.x += letter.vx * 0.016;
          letter.y += letter.vy * 0.016;
          // Update rotation
          letter.rotation += letter.rotationSpeed * 0.016;
          
          // Clamp rotation speed
          letter.rotationSpeed = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, letter.rotationSpeed));
          
          // Clamp velocity
          const speed = Math.sqrt(letter.vx * letter.vx + letter.vy * letter.vy);
          if (speed > maxSpeed) {
            letter.vx = (letter.vx / speed) * maxSpeed;
            letter.vy = (letter.vy / speed) * maxSpeed;
          }
          
          // Collision detection with main C logo FIRST (before boundary check)
          const dxLogo = letter.x - currentX;
          const dyLogo = letter.y - currentY;
          const distLogo = Math.sqrt(dxLogo * dxLogo + dyLogo * dyLogo);
          const minDistLogo = logoRadius + letter.size / 2;
          
          if (distLogo < minDistLogo) {
            collisionCount++;
            
            if (distLogo > 0) {
              const nx = dxLogo / distLogo;
              const ny = dyLogo / distLogo;
              const overlap = minDistLogo - distLogo;
              
              // Push outward based on bounce setting
              letter.x += nx * overlap * (0.1 + bounceStrength * 0.1);
              letter.y += ny * overlap * (0.1 + bounceStrength * 0.1);
              
              // Velocity redirect based on bounce
              const dot = letter.vx * nx + letter.vy * ny;
              if (dot < 0) {
                letter.vx -= dot * nx * (0.2 + bounceStrength * 0.4);
                letter.vy -= dot * ny * (0.2 + bounceStrength * 0.4);
              }
              // Outward push based on bounce
              letter.vx += nx * (2 + bounceStrength * 3);
              letter.vy += ny * (2 + bounceStrength * 3);
              
              // Spin on collision
              letter.rotationSpeed += gsap.utils.random(-2, 2);
              
              // Push on logo
              logoPushX -= nx * 0.1;
              logoPushY -= ny * 0.1;
            } else {
              // Letter at logo center, push gently
              const angle = Math.random() * Math.PI * 2;
              letter.x = currentX + Math.cos(angle) * (minDistLogo + 5);
              letter.y = currentY + Math.sin(angle) * (minDistLogo + 5);
              letter.vx = Math.cos(angle) * 15;
              letter.vy = Math.sin(angle) * 15;
            }
          }
          
          // Bounce off boundaries - energetic bounces
          if (letter.x < letterBounds.left) {
            letter.vx = Math.abs(letter.vx) * 0.9 + 20; // Add energy
            letter.x = letterBounds.left;
            letter.rotationSpeed += gsap.utils.random(-10, 10);
          } else if (letter.x > letterBounds.right) {
            letter.vx = -Math.abs(letter.vx) * 0.9 - 20;
            letter.x = letterBounds.right;
            letter.rotationSpeed += gsap.utils.random(-10, 10);
          }
          if (letter.y < letterBounds.top) {
            letter.vy = Math.abs(letter.vy) * 0.9 + 15;
            letter.y = letterBounds.top;
            letter.rotationSpeed += gsap.utils.random(-10, 10);
          } else if (letter.y > letterBounds.bottom) {
            letter.vy = -Math.abs(letter.vy) * 0.9 - 15;
            letter.y = letterBounds.bottom;
            letter.rotationSpeed += gsap.utils.random(-10, 10);
          }
          
          // Letter-to-letter collision - dynamic repulsion
          for (let j = i + 1; j < letterElements.length; j++) {
            const other = letterElements[j];
            const dx = other.x - letter.x;
            const dy = other.y - letter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (letter.size + other.size) / 2 + 10 + repulsionForce; // Dynamic spacing
            
            if (dist < minDist && dist > 0) {
              const nx = dx / dist;
              const ny = dy / dist;
              const overlap = minDist - dist;
              
              // Position push based on repulsion
              const nudge = overlap * (0.2 + repulsionForce * 0.05);
              letter.x -= nx * nudge;
              letter.y -= ny * nudge;
              other.x += nx * nudge;
              other.y += ny * nudge;
              
              // Separation velocity based on repulsion
              const sepVel = 2 + repulsionForce * 0.5;
              letter.vx -= nx * sepVel;
              letter.vy -= ny * sepVel;
              other.vx += nx * sepVel;
              other.vy += ny * sepVel;
            }
          }
          
          // Apply transform with rotation
          letter.el.style.transform = `translate(calc(-50% + ${letter.x}px), calc(-50% + ${letter.y}px)) rotate(${letter.rotation}deg)`;
        });
        
        // Apply accumulated push force from letters to logo velocity
        // Letters have minimal effect on logo - logo plows through
        if (collisionCount > 0) {
          const weight = Math.min(collisionCount * 0.3, 2); // Weak effect
          velocityX += logoPushX * weight;
          velocityY += logoPushY * weight;
          // Slight rotation nudge
          rotationVelocity += (logoPushX - logoPushY) * 0.05 * weight;
        }
      };
      
      // Replace animation loop with letters integration
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(function animate(currentTime) {
        if (!logoRef.current) {
          animationFrameId = requestAnimationFrame(animate);
          return;
        }

        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;
        
        const p = physicsRef.current;
        const logoSpeedMult = p.logoSpeed / 100; // 0-2
        const logoFriction = 1 - (p.friction * 0.00015); // Very subtle friction

        if (!isDraggingRef) {
          currentX += velocityX * deltaTime * logoSpeedMult;
          currentY += velocityY * deltaTime * logoSpeedMult;
          currentRotation += rotationVelocity * deltaTime;
          
          // Apply gravity to logo
          velocityY += p.gravity * 0.3 * deltaTime;
          
          if (currentX <= bounds.left || currentX >= bounds.right) {
            velocityX *= -0.8;
            currentX = currentX <= bounds.left ? bounds.left : bounds.right;
            velocityY += gsap.utils.random(-5, 5);
            rotationVelocity += gsap.utils.random(-3, 3);
          }
          
          if (currentY <= bounds.top || currentY >= bounds.bottom) {
            velocityY *= -0.8;
            currentY = currentY <= bounds.top ? bounds.top : bounds.bottom;
            velocityX += gsap.utils.random(-5, 5);
            rotationVelocity += gsap.utils.random(-3, 3);
          }
          
          // Smooth organic movement - scaled by logo speed
          velocityX += Math.sin(currentTime * 0.001) * 0.3 * logoSpeedMult;
          velocityY += Math.cos(currentTime * 0.0013) * 0.3 * logoSpeedMult;
          rotationVelocity += Math.sin(currentTime * 0.0007) * 0.05;
          
          // Apply friction
          velocityX *= logoFriction;
          velocityY *= logoFriction;
          rotationVelocity *= 0.999;
          
          logoRef.current.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentRotation}deg) translateZ(0)`;
        }

        updateLetters();
        animationFrameId = requestAnimationFrame(animate);
      });
      
      // Drag functionality
      const logo = logoRef.current;
      if (!logo) return;
      
      let startX = 0, startY = 0, initialX = 0, initialY = 0;
      
      const handleStart = (e: MouseEvent | TouchEvent) => {
        isDraggingRef = true;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        initialX = currentX;
        initialY = currentY;
        
        logo.style.cursor = 'grabbing';
      };
      
      const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        currentX = Math.max(bounds.left, Math.min(bounds.right, initialX + deltaX));
        currentY = Math.max(bounds.top, Math.min(bounds.bottom, initialY + deltaY));
        
        // Use direct style manipulation during drag for better performance
        logo.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentRotation}deg) translateZ(0)`;
      };
      
      const handleEnd = (e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef) return;
        
        isDraggingRef = false;
        logo.style.cursor = 'grab';
        
        // Calculate velocity from last movement for momentum
        const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
        
        velocityX = (clientX - startX) * 0.3;
        velocityY = (clientY - startY) * 0.3;
      };
      
      logo.style.cursor = 'grab';
      logo.addEventListener('mousedown', handleStart as EventListener);
      logo.addEventListener('touchstart', handleStart as EventListener);
      window.addEventListener('mousemove', handleMove as EventListener);
      window.addEventListener('touchmove', handleMove as EventListener);
      window.addEventListener('mouseup', handleEnd as EventListener);
      window.addEventListener('touchend', handleEnd as EventListener);

      // Cleanup function
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
      };

      // Initial states
      gsap.set([nameRef.current, titleRef.current, contactRef.current, summaryRef.current, ctaRef.current], {
        opacity: 0,
        y: 40,
      });

      // Staggered entrance animation
      const tl = gsap.timeline({ delay: 0.3 });

      tl.to(nameRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      })
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.6')
      .to(contactRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.5')
      .to(summaryRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.4')
      .to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.4');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const contactLinks = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Denver, CO',
      href: null,
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'matthew@chrestenson.com',
      href: 'mailto:matthew@chrestenson.com',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: '805.452.8932',
      href: 'tel:+18054528932',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      label: 'chrestenson.com',
      href: 'https://chrestenson.com',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/chrestenson',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      id="hero" 
      className="min-h-screen flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-32 relative overflow-hidden"
    >
      {/* Subtle gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#FAFAFA] to-[#F0F5FF] opacity-50" />
      
      <div className="max-w-full relative z-10 text-center px-4">
        {/* C Logo and Floating Letters Container */}
        <div className="mb-12 flex justify-center relative">
          {/* Floating letters - positioned relative to logo center */}
          <div 
            ref={lettersContainerRef} 
            className="absolute"
            style={{ 
              width: 'min(90vw, 700px)', 
              height: 'min(280px, 400px)', 
              left: '50%', 
              top: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 5
            }}
          >
            {/* Letters (pointer-events-none) */}
            {letters.map((letter, index) => (
              <span
                key={index}
                className="absolute font-black text-[#1D1D1F] select-none pointer-events-none text-sm md:text-xl"
                style={{ 
                  willChange: 'transform', 
                  left: '50%', 
                  top: '50%'
                }}
              >
                {letter}
              </span>
            ))}
          </div>
          
          {/* Physics Controls - positioned relative to logo wrapper, bottom-right */}
          <div className="absolute z-20" style={{ right: 'max(8px, calc(50% - min(45vw, 350px)))', bottom: '0' }}>
            <button
              onClick={() => setShowControls(!showControls)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                showControls 
                  ? 'bg-[#1D1D1F] text-white' 
                  : 'bg-white/60 text-[#1D1D1F]/60 hover:bg-white/90 hover:text-[#1D1D1F]'
              }`}
              aria-label="Physics controls"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${showControls ? 'rotate-90' : ''}`}
              >
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            
            {/* Panel slides up from button - 2 column layout */}
            <div className={`absolute bottom-10 right-0 transition-all duration-300 origin-bottom-right ${
              showControls 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
            }`}>
              <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-lg p-4 border border-gray-100/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#1D1D1F] font-medium text-[10px] tracking-wide uppercase">Physics</span>
                  <button
                    onClick={() => setPhysics({
                      logoSpeed: 100,
                      letterSpeed: 100,
                      bounce: 50,
                      repulsion: 50,
                      friction: 50,
                      gravity: 0
                    })}
                    className="text-[9px] text-gray-400 hover:text-[#1D1D1F] transition-colors"
                  >
                    Reset
                  </button>
                </div>
                
                {/* 2 Column Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3" style={{ width: '280px' }}>
                  {/* Logo Speed */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Logo</span>
                      <span className="text-[#1D1D1F] font-medium tabular-nums">{physics.logoSpeed}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={physics.logoSpeed}
                      onChange={(e) => setPhysics(p => ({ ...p, logoSpeed: Number(e.target.value) }))}
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1D1D1F] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                  
                  {/* Bounce */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Bounce</span>
                      <span className="text-[#1D1D1F] font-medium tabular-nums">{physics.bounce}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={physics.bounce}
                      onChange={(e) => setPhysics(p => ({ ...p, bounce: Number(e.target.value) }))}
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1D1D1F] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                  
                  {/* Letter Speed */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Letters</span>
                      <span className="text-[#1D1D1F] font-medium tabular-nums">{physics.letterSpeed}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={physics.letterSpeed}
                      onChange={(e) => setPhysics(p => ({ ...p, letterSpeed: Number(e.target.value) }))}
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1D1D1F] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                  
                  {/* Repulsion */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Repulsion</span>
                      <span className="text-[#1D1D1F] font-medium tabular-nums">{physics.repulsion}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={physics.repulsion}
                      onChange={(e) => setPhysics(p => ({ ...p, repulsion: Number(e.target.value) }))}
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1D1D1F] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                  
                  {/* Friction */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Friction</span>
                      <span className="text-[#1D1D1F] font-medium tabular-nums">{physics.friction}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={physics.friction}
                      onChange={(e) => setPhysics(p => ({ ...p, friction: Number(e.target.value) }))}
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1D1D1F] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                  
                  {/* Gravity */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Gravity</span>
                      <span className="text-[#1D1D1F] font-medium tabular-nums">{physics.gravity > 0 ? '+' : ''}{physics.gravity}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={physics.gravity}
                      onChange={(e) => setPhysics(p => ({ ...p, gravity: Number(e.target.value) }))}
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1D1D1F] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* C Logo */}
          <img 
            ref={logoRef}
            src="/black-letter-c.png" 
            alt="C" 
            className="w-48 h-48 md:w-72 md:h-72 lg:w-96 lg:h-96 object-contain relative z-10"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* Name - Brand Hierarchy */}
        <div ref={nameRef} className="mb-8">
          {/* CHRESTENSON - Primary */}
          <h1 className="text-[10vw] md:text-[8vw] lg:text-[7vw] font-black text-[#6E6E73] uppercase tracking-tight leading-none mb-2">
            CHRESTENSON
          </h1>
          {/* MATTHEW - Secondary with underline */}
          <div className="flex items-center justify-center gap-4 mb-1">
            <div className="h-px w-20 bg-[#1D1D1F]" />
            <p className="text-2xl md:text-3xl lg:text-4xl font-light text-[#1D1D1F] uppercase tracking-[0.3em]">
              MATTHEW
            </p>
            <div className="h-px w-20 bg-[#1D1D1F]" />
          </div>
        </div>
        
        {/* Title */}
        <p 
          ref={titleRef}
          className="text-sm md:text-base lg:text-lg text-[#6E6E73] font-normal mb-8 tracking-[0.2em] uppercase"
        >
          Executive Strategist{' '}
          <span className="text-[#D1D1D6]">|</span>{' '}
          Brand Architect{' '}
          <span className="text-[#D1D1D6]">|</span>{' '}
          Platform Developer
        </p>

        {/* Contact Links */}
        <div 
          ref={contactRef}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-12 text-sm"
        >
          {contactLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              {link.href ? (
                <a
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 text-[#6E6E73] hover:text-[#0071E3] transition-colors duration-300 group"
                >
                  <span className="text-[#86868B] group-hover:text-[#0071E3] transition-colors duration-300">
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </a>
              ) : (
                <span className="flex items-center gap-2 text-[#6E6E73]">
                  <span className="text-[#86868B]">{link.icon}</span>
                  <span>{link.label}</span>
                </span>
              )}
              {index < contactLinks.length - 1 && (
                <span className="text-[#E5E5E5] ml-4 hidden md:inline">|</span>
              )}
            </div>
          ))}
        </div>

        {/* Executive Summary */}
        <div 
          ref={summaryRef}
          className="w-full max-w-5xl mx-auto mb-16"
        >
          {/* Section Label */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-[#E5E5E5]" />
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#0071E3]">
              The Short Version
            </span>
            <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-[#E5E5E5]" />
          </div>
          
          {/* Summary Cards */}
          <div className="border-t border-[#E5E5E5]">
            {/* Card 1 */}
            <div className="py-8 md:py-10 border-b border-[#E5E5E5] group">
              <div className="flex gap-4 md:gap-6">
                <div className="flex-shrink-0 w-10 h-10 border border-[#E5E5E5] flex items-center justify-center group-hover:border-[#0071E3] group-hover:bg-[#0071E3] transition-all">
                  <span className="text-xs font-mono text-[#86868B] group-hover:text-white transition-colors">01</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base text-[#424245] leading-relaxed">
                    <span className="text-[#1D1D1F] font-medium">AI-augmented strategist</span> and <span className="text-[#1D1D1F] font-medium">brand architect</span> with <span className="text-[#0071E3] font-mono text-sm">30+ years</span> of creative leadership, using LLMs and generative AI to accelerate research, content production, and visual asset creation at enterprise scale.
                  </p>
                  <p className="text-sm md:text-base text-[#6E6E73] leading-relaxed mt-3">
                    Demonstrated ability to transform complex market intelligence into investor-ready documentation, brand strategies, and full-stack digital products—work that previously required teams, now executed with AI-assisted workflows.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="py-8 md:py-10 border-b border-[#E5E5E5] group">
              <div className="flex gap-4 md:gap-6">
                <div className="flex-shrink-0 w-10 h-10 border border-[#E5E5E5] flex items-center justify-center group-hover:border-[#0071E3] group-hover:bg-[#0071E3] transition-all">
                  <span className="text-xs font-mono text-[#86868B] group-hover:text-white transition-colors">02</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base text-[#424245] leading-relaxed">
                    Unique combination of <span className="text-[#1D1D1F] font-medium">studio-grade production</span> experience and <span className="text-[#1D1D1F] font-medium">hospitality brand-building</span> with current <span className="text-[#1D1D1F] font-medium">AI-first strategic advisory</span> across health technology, hospitality, and consumer goods.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="text-xs font-mono tracking-wider text-[#86868B] border border-[#E5E5E5] px-3 py-1.5">DISNEY</span>
                    <span className="text-xs font-mono tracking-wider text-[#86868B] border border-[#E5E5E5] px-3 py-1.5">NATIONAL GEOGRAPHIC</span>
                    <span className="text-xs font-mono tracking-wider text-[#86868B] border border-[#E5E5E5] px-3 py-1.5">RIDLEY SCOTT ASSOCIATES</span>
                    <span className="text-xs font-mono tracking-wider text-[#0071E3] border border-[#0071E3]/30 px-3 py-1.5">6 VENTURES → EXIT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tagline */}
          <div className="pt-8 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-[#0071E3]/30" />
            <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#0071E3]">
              AI-native — not just AI-literate
            </span>
            <div className="h-px w-12 bg-[#0071E3]/30" />
          </div>
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:matthew@chrestenson.com"
            className="group inline-flex items-center gap-3 bg-[#0071E3] text-white px-8 py-4 text-base font-medium hover:bg-[#0077ED] transition-all duration-300 hover:shadow-lg hover:shadow-[#0071E3]/25 hover:-translate-y-0.5"
          >
            <span>Start a Conversation</span>
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <button
            onClick={() => setIsResumeOpen(true)}
            className="group inline-flex items-center gap-3 border-2 border-[#0071E3] text-[#0071E3] px-8 py-4 text-base font-medium hover:bg-[#0071E3] hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>View Resume</span>
          </button>
          <a
            href="tel:+18054528932"
            className="group inline-flex items-center gap-3 bg-[#1D1D1F] text-white px-8 py-4 text-base font-medium hover:bg-[#2D2D2F] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Call Now</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#86868B] animate-bounce">
        <span className="text-xs tracking-wider uppercase">Scroll</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </section>
  );
};
