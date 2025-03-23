
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Construction } from "lucide-react";
import { NeonButton } from "@/components/NeonButton";
import { PageTransition } from "@/components/PageTransition";
import { slideUpVariants } from "@/utils/animations";

const SupremeCourt = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center mb-8">
            <NeonButton
              variant="blue"
              size="sm"
              onClick={() => navigate("/home")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </NeonButton>
            <h1 className="text-2xl font-bold neon-text text-neon-pink">Supreme Court</h1>
          </header>
          
          <motion.div
            className="glass-card rounded-lg p-12 border border-gray-700 text-center"
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            <Construction className="h-20 w-20 mx-auto mb-6 text-neon-pink animate-float" />
            
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            
            <p className="text-gray-300 max-w-md mx-auto mb-8">
              The Supreme Court integration is currently under development and will be available in a future update.
            </p>
            
            <NeonButton
              variant="pink"
              onClick={() => navigate("/home")}
            >
              Return to Home
            </NeonButton>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SupremeCourt;
