import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen bg-black relative overflow-hidden ${className}`}
    >
      {/* Background gradients from Index.tsx */}
      <div className="absolute inset-0 bg-gradient-to-br from-degen-dark via-black to-degen-dark opacity-95 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-degen-green/20 to-degen-accent/10 z-0"></div>
      
      {children}
    </motion.div>
  );
};

export default PageTransition;
