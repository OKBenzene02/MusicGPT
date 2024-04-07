import { useRef, useState, useEffect } from 'react';

function DimensionsProvider({ children }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();

    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div ref={containerRef}>
      {children({
        containerWidth: dimensions.width,
        containerHeight: dimensions.height,
      })}
    </div>
  );
}

export default DimensionsProvider;
