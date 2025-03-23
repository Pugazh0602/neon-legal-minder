
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Database } from "lucide-react";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/NeonInput";
import { PageTransition } from "@/components/PageTransition";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { eCourtService, CaseDetails, SupremeCourtCaseParams } from "@/services/eCourtService";
import { caseStorageService } from "@/services/caseStorageService";
import { notificationService } from "@/services/notificationService";
import { slideUpVariants, fadeInVariants } from "@/utils/animations";
import { useToast } from "@/hooks/use-toast";

const SupremeCourt = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [diaryNumber, setDiaryNumber] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!diaryNumber) {
      setError("Please enter a Diary Number");
      return;
    }
    
    if (!year) {
      setError("Please enter a Year");
      return;
    }
    
    // Basic validation for diary number and year
    if (isNaN(Number(diaryNumber))) {
      setError("Diary Number must be numeric");
      toast({
        title: "Invalid Input",
        description: "Diary Number must be numeric",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(Number(year)) || year.length !== 4) {
      setError("Please enter a valid 4-digit Year");
      toast({
        title: "Invalid Input",
        description: "Please enter a valid 4-digit Year",
        variant: "destructive",
      });
      return;
    }
    
    setError("");
    setLoading(true);
    setCaseDetails(null);
    
    try {
      const params: SupremeCourtCaseParams = {
        diaryNumber,
        year
      };
      
      const result = await eCourtService.getSupremeCourtCaseStatus(params);
      
      // Check if result indicates an error or not found state
      if (result.status === 'Error' || result.status === 'Not Found') {
        setError(result.purpose || 'Failed to retrieve case details');
        toast({
          title: result.status,
          description: result.purpose || "Failed to retrieve case details",
          variant: "destructive",
        });
        setCaseDetails(null);
      } else {
        setCaseDetails(result);
        if (result.status === 'Pending' && result.nextHearingDate) {
          toast({
            title: "Case Found",
            description: `Next hearing date: ${result.nextHearingDate}`,
          });
        } else {
          toast({
            title: "Case Found",
            description: "Case details retrieved successfully",
          });
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to fetch case details. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch case details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveCase = () => {
    if (!caseDetails) return;
    
    try {
      const savedCase = caseStorageService.saveCase(caseDetails);
      
      // Set reminder for next hearing date if available
      if (savedCase.nextHearingDate) {
        const reminderDate = new Date(savedCase.nextHearingDate);
        reminderDate.setDate(reminderDate.getDate() - 1); // Remind 1 day before
        
        notificationService.addReminder(
          savedCase.id,
          savedCase.caseNumber,
          reminderDate,
          savedCase.courtName
        );
      }
      
      notificationService.addNotification(
        "Case Saved",
        `Case ${savedCase.caseNumber} has been saved to your cases`
      );
      
      toast({
        title: "Success",
        description: `Case ${savedCase.caseNumber} has been saved`,
      });
      
      // Navigate to My Cases screen
      navigate("/my-cases");
    } catch (error) {
      console.error("Error saving case:", error);
      setError("Failed to save case. Please try again.");
      toast({
        title: "Error",
        description: "Failed to save case. Please try again.",
        variant: "destructive",
      });
    }
  };
  
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
          
          <div className="glass-card rounded-lg p-6 border border-gray-700 mb-8">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <NeonInput
                  type="text"
                  label="Diary Number"
                  value={diaryNumber}
                  onChange={(e) => setDiaryNumber(e.target.value)}
                  placeholder="Enter Diary Number"
                  variant="pink"
                  className="flex-1"
                  disabled={loading}
                />
                
                <NeonInput
                  type="text"
                  label="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Enter Year (e.g. 2025)"
                  variant="pink"
                  className="flex-1"
                  disabled={loading}
                />
                
                <div className="flex items-end">
                  <NeonButton
                    onClick={handleSearch}
                    disabled={loading}
                    variant="pink"
                    className="h-[42px] md:mt-8"
                  >
                    {loading ? <LoadingSpinner size="sm" variant="white" /> : "Search"}
                  </NeonButton>
                </div>
              </div>
              
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              
              {!error && (
                <p className="text-gray-400 text-xs mt-1">
                  Enter the diary number and year to search for Supreme Court cases
                </p>
              )}
            </div>
          </div>
          
          {caseDetails && (
            <motion.div
              className="glass-card rounded-lg p-6 border border-gray-700"
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Case Details</h2>
                <span className={`text-sm px-2 py-0.5 rounded ${
                  caseDetails.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                  caseDetails.status === 'Disposed' ? 'bg-green-500/20 text-green-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {caseDetails.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-400">Case Number</p>
                  <p>{caseDetails.caseNumber}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Court</p>
                  <p>{caseDetails.courtName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Filing Date</p>
                  <p>{caseDetails.filingDate}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Judge</p>
                  <p>{caseDetails.judgeName || 'Not assigned'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Petitioner</p>
                  <p>{caseDetails.petitioner}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Respondent</p>
                  <p>{caseDetails.respondent}</p>
                </div>
                
                {caseDetails.lastHearingDate && (
                  <div>
                    <p className="text-sm text-gray-400">Last Hearing</p>
                    <p>{caseDetails.lastHearingDate}</p>
                  </div>
                )}
                
                {caseDetails.nextHearingDate && (
                  <div>
                    <p className="text-sm text-gray-400">Next Hearing</p>
                    <p className="text-neon-pink">{caseDetails.nextHearingDate}</p>
                  </div>
                )}
                
                {caseDetails.purpose && (
                  <div>
                    <p className="text-sm text-gray-400">Purpose</p>
                    <p>{caseDetails.purpose}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <NeonButton onClick={handleSaveCase} variant="pink">
                  Save Case
                </NeonButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default SupremeCourt;
