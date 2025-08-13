import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CyberButton from "@/components/CyberButton";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#071219]">
        <div className="text-center px-4 py-8 max-w-md w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-6 py-3 rounded-full bg-[#09FBD3]/20 border-2 border-[#09FBD3] inline-block shadow-[0_0_15px_rgba(9,251,211,0.5)]"
          >
            <span className="text-md font-bold text-[#09FBD3] drop-shadow-[0_0_8px_rgba(9,251,211,1)]">ERROR 404</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl mb-8 font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          >
            Page Not Found
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl mb-10 text-[#09FBD3] font-semibold max-w-md mx-auto drop-shadow-[0_0_8px_rgba(9,251,211,0.5)]"
          >
            The destination you're looking for doesn't exist or has been moved.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white text-xl mb-10 font-semibold drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
          >
            Would you like to return to a known location in the Cluster Protocol?
          </motion.p>
          
          <CyberButton 
            onClick={() => navigate('/')} 
            variant="primary"
            className="w-full max-w-xs mx-auto text-xl py-4 shadow-[0_0_15px_rgba(9,251,211,0.5)]"
          >
            Return to Start
          </CyberButton>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
