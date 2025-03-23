
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, FileText, Trash2, Bell, Calendar } from "lucide-react";
import { NeonButton } from "@/components/NeonButton";
import { PageTransition } from "@/components/PageTransition";
import { caseStorageService } from "@/services/caseStorageService";
import { SavedCase } from "@/services/eCourtService";
import { notificationService } from "@/services/notificationService";
import { staggeredListVariants, listItemVariants } from "@/utils/animations";

const MyCases = () => {
  const navigate = useNavigate();
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  
  useEffect(() => {
    loadCases();
  }, []);
  
  const loadCases = () => {
    const cases = caseStorageService.getSavedCases();
    setSavedCases(cases);
  };
  
  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this case?");
    if (!confirmed) return;
    
    caseStorageService.deleteCase(id);
    loadCases();
    
    notificationService.addNotification(
      "Case Deleted",
      "The case has been removed from your saved cases"
    );
  };
  
  const setReminder = (caseItem: SavedCase) => {
    // Simple date picker
    const date = prompt("Enter reminder date (YYYY-MM-DD):");
    if (!date) return;
    
    try {
      const reminderDate = new Date(date);
      if (isNaN(reminderDate.getTime())) {
        throw new Error("Invalid date format");
      }
      
      notificationService.addReminder(
        caseItem.id,
        caseItem.caseNumber,
        reminderDate,
        caseItem.courtName
      );
      
      notificationService.addNotification(
        "Reminder Set",
        `A reminder has been set for ${caseItem.caseNumber} on ${date}`
      );
    } catch (error) {
      console.error("Error setting reminder:", error);
      alert("Invalid date format. Please use YYYY-MM-DD format.");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <NeonButton
                variant="blue"
                size="sm"
                onClick={() => navigate("/home")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </NeonButton>
              <h1 className="text-2xl font-bold neon-text text-neon-blue">My Cases</h1>
            </div>
            
            <NeonButton
              variant="blue"
              size="sm"
              onClick={() => navigate("/district-court")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Case
            </NeonButton>
          </header>
          
          {savedCases.length > 0 ? (
            <motion.div
              className="space-y-4"
              variants={staggeredListVariants}
              initial="hidden"
              animate="visible"
            >
              {savedCases.map((caseItem) => (
                <motion.div
                  key={caseItem.id}
                  variants={listItemVariants}
                  className="glass-card p-6 rounded-lg border border-gray-700 hover:border-neon-blue transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-medium">{caseItem.caseNumber}</h3>
                        <span className={`text-sm px-2 py-0.5 rounded ${
                          caseItem.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          caseItem.status === 'Disposed' ? 'bg-green-500/20 text-green-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {caseItem.status}
                        </span>
                      </div>
                      <p className="text-gray-400">{caseItem.courtName}</p>
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Petitioner</p>
                          <p className="text-sm">{caseItem.petitioner}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Respondent</p>
                          <p className="text-sm">{caseItem.respondent}</p>
                        </div>
                        
                        {caseItem.nextHearingDate && (
                          <div>
                            <p className="text-sm text-gray-500">Next Hearing</p>
                            <p className="text-sm text-neon-blue">{caseItem.nextHearingDate}</p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm text-gray-500">Filing Date</p>
                          <p className="text-sm">{caseItem.filingDate}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-2">
                      <NeonButton
                        size="sm"
                        variant="blue"
                        onClick={() => navigate(`/case-details/${caseItem.id}`)}
                        className="flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-1" /> View
                      </NeonButton>
                      
                      <NeonButton
                        size="sm"
                        variant="purple"
                        onClick={() => setReminder(caseItem)}
                        className="flex items-center"
                      >
                        <Calendar className="h-4 w-4 mr-1" /> Remind
                      </NeonButton>
                      
                      <NeonButton
                        size="sm"
                        variant="pink"
                        onClick={() => handleDelete(caseItem.id)}
                        className="flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </NeonButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="glass-card p-8 rounded-lg border border-gray-700 text-center">
              <h3 className="text-lg font-medium mb-4">No Saved Cases</h3>
              <p className="text-gray-400 mb-6">
                You haven't saved any cases yet. Search for cases in the District or High Courts to add them here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NeonButton
                  onClick={() => navigate("/district-court")}
                >
                  District Court
                </NeonButton>
                <NeonButton
                  onClick={() => navigate("/high-court")}
                  variant="purple"
                >
                  High Court
                </NeonButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MyCases;
