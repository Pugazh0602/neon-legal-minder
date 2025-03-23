
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Scale, Building2, GavelIcon, FileQuestion, Bell, Plus } from "lucide-react";
import { CourtCard } from "@/components/CourtCard";
import { NeonButton } from "@/components/NeonButton";
import { PageTransition } from "@/components/PageTransition";
import { notificationService } from "@/services/notificationService";
import { caseStorageService } from "@/services/caseStorageService";
import { SavedCase } from "@/services/eCourtService";
import { staggeredListVariants, listItemVariants } from "@/utils/animations";

const Home = () => {
  const navigate = useNavigate();
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
    }
    
    // Load saved cases
    const cases = caseStorageService.getSavedCases();
    setSavedCases(cases);
    
    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe(notifications => {
      setUnreadNotifications(notifications.filter(n => !n.read).length);
    });
    
    return () => {
      unsubscribe();
    };
  }, [navigate]);
  
  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-bold neon-text text-neon-blue">eCourts Tracker</h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <NeonButton
                  variant="blue"
                  size="sm"
                  onClick={() => navigate("/notifications")}
                >
                  <Bell className="h-5 w-5" />
                </NeonButton>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-neon-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </div>
              
              <NeonButton
                variant="pink"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("isLoggedIn");
                  navigate("/login");
                }}
              >
                Sign Out
              </NeonButton>
            </div>
          </header>
          
          <main className="space-y-12">
            <section>
              <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2 neon-text">
                Court Access
              </h2>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                variants={staggeredListVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={listItemVariants}>
                  <CourtCard
                    title="District Court"
                    icon={<GavelIcon className="text-neon-blue" />}
                    onClick={() => handleNavigate("/district-court")}
                  />
                </motion.div>
                
                <motion.div variants={listItemVariants}>
                  <CourtCard
                    title="High Court"
                    icon={<Building2 className="text-neon-purple" />}
                    onClick={() => handleNavigate("/high-court")}
                  />
                </motion.div>
                
                <motion.div variants={listItemVariants}>
                  <CourtCard
                    title="Supreme Court"
                    icon={<Scale className="text-neon-pink" />}
                    onClick={() => handleNavigate("/supreme-court")}
                    className="opacity-60"
                  />
                </motion.div>
              </motion.div>
            </section>
            
            <section>
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                <h2 className="text-xl font-semibold neon-text">My Cases</h2>
                <NeonButton
                  variant="blue"
                  size="sm"
                  onClick={() => handleNavigate("/my-cases")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Case
                </NeonButton>
              </div>
              
              {savedCases.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  variants={staggeredListVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {savedCases.slice(0, 4).map((caseItem) => (
                    <motion.div
                      key={caseItem.id}
                      variants={listItemVariants}
                      className="glass-card p-4 rounded-lg border border-gray-700 cursor-pointer hover:border-neon-blue transition-all duration-300"
                      onClick={() => handleNavigate(`/my-cases/${caseItem.id}`)}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium">{caseItem.caseNumber}</h3>
                        <span className={`text-sm px-2 py-0.5 rounded ${
                          caseItem.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          caseItem.status === 'Disposed' ? 'bg-green-500/20 text-green-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {caseItem.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{caseItem.courtName}</p>
                      <div className="mt-2 text-sm">
                        <p>Petitioner: {caseItem.petitioner}</p>
                        <p>Respondent: {caseItem.respondent}</p>
                      </div>
                      {caseItem.nextHearingDate && (
                        <div className="mt-2 text-sm">
                          <p className="text-neon-blue">Next Hearing: {caseItem.nextHearingDate}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="glass-card p-8 rounded-lg border border-gray-700 text-center">
                  <FileQuestion className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-lg font-medium mb-2">No Cases Saved</h3>
                  <p className="text-gray-400 mb-4">
                    Add cases from any court to track them in one place
                  </p>
                  <NeonButton
                    onClick={() => handleNavigate("/district-court")}
                  >
                    Search Cases
                  </NeonButton>
                </div>
              )}
              
              {savedCases.length > 4 && (
                <div className="text-center mt-4">
                  <NeonButton
                    variant="purple"
                    size="sm"
                    onClick={() => handleNavigate("/my-cases")}
                  >
                    View All Cases
                  </NeonButton>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default Home;
