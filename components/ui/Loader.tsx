import { motion } from 'framer-motion';

export function Loader() {
  return (
    <motion.div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '4px solid hsl(var(--primary) / 0.2)',
        borderTopColor: 'hsl(var(--primary))',
      }}
      animate={{ rotate: 360 }}
      transition={{
        loop: Infinity,
        ease: 'linear',
        duration: 1,
      }}
    />
  );
}