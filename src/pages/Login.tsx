
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/NeonInput";
import { PageTransition } from "@/components/PageTransition";
import { notificationService } from "@/services/notificationService";
import { neonPulseAnimation, fadeInVariants } from "@/utils/animations";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      localStorage.setItem("isLoggedIn", "true");
      
      // Request notification permission
      if ('Notification' in window) {
        Notification.requestPermission();
      }
      
      // Add welcome notification
      notificationService.addNotification(
        "Welcome back",
        "You have successfully logged in to eCourts Tracker"
      );
      
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        password: "Invalid email or password"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="glass-card rounded-lg p-8 border border-gray-700"
            {...neonPulseAnimation}
          >
            <div className="text-center mb-8">
              <motion.h1 
                className="text-3xl font-bold neon-text text-neon-blue mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                eCourts Tracker
              </motion.h1>
              <motion.p 
                className="text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Sign in to manage your cases
              </motion.p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <NeonInput
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  error={errors.email}
                  disabled={loading}
                />
                
                <NeonInput
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  error={errors.password}
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 bg-transparent border-gray-600 rounded focus:ring-neon-blue"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="text-neon-blue hover:text-blue-300">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <NeonButton
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </NeonButton>
              
              <div className="text-center mt-4">
                <span className="text-gray-400">Don't have an account? </span>
                <a 
                  onClick={() => navigate("/signup")} 
                  className="text-neon-blue hover:text-blue-300 cursor-pointer"
                >
                  Sign up
                </a>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;
