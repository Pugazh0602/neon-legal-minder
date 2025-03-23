
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Database, Gavel, List, MapPin, Shield } from "lucide-react";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/NeonInput";
import { PageTransition } from "@/components/PageTransition";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { eCourtService, CaseDetails } from "@/services/eCourtService";
import { caseStorageService } from "@/services/caseStorageService";
import { notificationService } from "@/services/notificationService";
import { slideUpVariants, fadeInVariants } from "@/utils/animations";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type SearchType = 'cnr' | 'status' | 'orders' | 'cause' | 'caveat' | 'location';

const DistrictCourt = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<SearchType>('cnr');
  const [cnrNumber, setCnrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [error, setError] = useState("");
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [captchaValue, setCaptchaValue] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  
  const searchOptions = [
    { type: 'cnr', label: 'CNR Number', icon: <Database className="h-4 w-4" /> },
    { type: 'status', label: 'Case Status', icon: <Search className="h-4 w-4" /> },
    { type: 'orders', label: 'Court Orders', icon: <Gavel className="h-4 w-4" /> },
    { type: 'cause', label: 'Cause List', icon: <List className="h-4 w-4" /> },
    { type: 'caveat', label: 'Caveat Search', icon: <Shield className="h-4 w-4" /> },
    { type: 'location', label: 'Court Location', icon: <MapPin className="h-4 w-4" /> },
  ];

  const handleSearch = async () => {
    if (!cnrNumber) {
      setError("Please enter a CNR number");
      return;
    }
    
    // CNR number validation (typically 16 digits)
    const cnrRegex = /^\d{16}$/;
    if (!cnrRegex.test(cnrNumber) && searchType === 'cnr') {
      setError("Please enter a valid 16-digit CNR number");
      return;
    }
    
    setError("");
    setLoading(true);
    setCaseDetails(null);
    
    try {
      if (searchType === 'cnr' || searchType === 'status') {
        // Simulate showing a captcha in a real implementation
        // Here we set showCaptcha to true and would fetch the captcha image
        setShowCaptcha(true);
        setCaptchaImage("mock_captcha_image_url");
        
        // Wait for captcha input in a real implementation
        // Here we're just simulating it with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Now proceed with case lookup
        setShowCaptcha(false);
        const result = await eCourtService.getDistrictCourtCaseStatus(cnrNumber);
        
        // Check if result indicates an error or not found state
        if (result.status === 'Error' || result.status === 'Not Found') {
          setError(result.purpose || 'Failed to retrieve case details');
          toast({
            title: "Search Error",
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
          }
        }
      } else {
        // Handle other search types
        toast({
          title: "Feature Not Available",
          description: "This search type is not implemented in the demo",
          variant: "destructive",
        });
        setError("This search type is not implemented in the demo");
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
  
  const submitCaptcha = () => {
    if (!captchaValue) {
      setError("Please enter the captcha");
      return;
    }
    
    // In a real implementation, we would validate the captcha
    // Here we just simulate it with a delay
    setLoading(true);
    setTimeout(() => {
      setShowCaptcha(false);
      setLoading(false);
      handleSearch();
    }, 1000);
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
            <h1 className="text-2xl font-bold neon-text text-neon-blue">District Court</h1>
          </header>
          
          <div className="glass-card rounded-lg p-6 border border-gray-700 mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {searchOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setSearchType(option.type as SearchType)}
                  className={`flex items-center px-3 py-2 rounded-md transition-all duration-300 ${
                    searchType === option.type
                      ? "bg-neon-blue/20 border border-neon-blue text-white"
                      : "bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </button>
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <NeonInput
                  type="text"
                  label="CNR Number"
                  value={cnrNumber}
                  onChange={(e) => setCnrNumber(e.target.value)}
                  placeholder="Enter CNR Number"
                  className="flex-1"
                  disabled={loading}
                />
                
                <div className="flex items-end">
                  <NeonButton
                    onClick={handleSearch}
                    disabled={loading}
                    className="h-[42px] md:mt-8"
                  >
                    {loading ? <LoadingSpinner size="sm" variant="white" /> : "Search"}
                  </NeonButton>
                </div>
              </div>
              
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              
              {showCaptcha && (
                <motion.div
                  className="mt-4 p-4 border border-gray-700 rounded-lg"
                  variants={slideUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-lg font-medium mb-3">Enter Captcha</h3>
                  
                  {captchaImage && (
                    <div className="mb-4 p-3 bg-gray-800 rounded-md w-48 h-16 flex items-center justify-center">
                      <span className="text-lg font-mono tracking-widest text-gray-300">CAPTCHA</span>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <NeonInput
                      type="text"
                      value={captchaValue}
                      onChange={(e) => setCaptchaValue(e.target.value)}
                      placeholder="Enter captcha"
                      className="flex-1"
                    />
                    
                    <NeonButton onClick={submitCaptcha} disabled={loading}>
                      {loading ? <LoadingSpinner size="sm" variant="white" /> : "Submit"}
                    </NeonButton>
                  </div>
                </motion.div>
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
                    <p className="text-neon-blue">{caseDetails.nextHearingDate}</p>
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
                <NeonButton onClick={handleSaveCase} variant="purple">
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

export default DistrictCourt;
