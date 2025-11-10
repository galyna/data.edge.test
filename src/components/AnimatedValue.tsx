import { useEffect, useState } from "react";

interface AnimatedValueProps {
  value: number;
  format?: (val: number) => string;
  className?: string;
}

const AnimatedValue = ({ value, format, className = "" }: AnimatedValueProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setIsUpdating(true);
      setPrevValue(value);
      
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  const displayValue = format ? format(value) : value.toString();

  return (
    <span 
      className={`${className} transition-all duration-300 ${
        isUpdating ? 'text-signal scale-105' : ''
      }`}
    >
      {displayValue}
    </span>
  );
};

export default AnimatedValue;
