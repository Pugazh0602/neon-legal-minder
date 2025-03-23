
import axios from 'axios';

const API_BASE_URL = 'https://apis.akshit.net/eciapi/17';
const API_KEY = 'ECIAPI-ziaB8ExvjMEHTIK9twWxOCOIMnnhk7Z4';

// Helper function to validate CNR number format (XXCGDDYYYYNNNNNNN)
// where XX is state code, CG is court complex, DD is district code, 
// YYYY is case filing year, and NNNNNNN is the unique registration number
export const isValidCNR = (cnr: string): boolean => {
  // CNR format: Typically 16 digits, but can have alphabets in specific positions
  const cnrRegex = /^[A-Z0-9]{2}[A-Z0-9]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/;
  return cnrRegex.test(cnr);
};

export interface CaseDetails {
  caseNumber: string;
  courtName: string;
  status: string;
  filingDate: string;
  petitioner: string;
  respondent: string;
  lastHearingDate?: string;
  nextHearingDate?: string;
  purpose?: string;
  judgeName?: string;
}

export interface SavedCase extends CaseDetails {
  id: string;
  savedAt: string;
  reminderDate?: string;
}

export interface SupremeCourtCaseParams {
  diaryNumber: string;
  year: string;
}

class ECourtService {
  async getDistrictCourtCaseStatus(cnrNumber: string): Promise<CaseDetails> {
    try {
      console.log(`Fetching district court case status for CNR: ${cnrNumber}`);
      
      // Validate CNR number format first
      if (!isValidCNR(cnrNumber)) {
        return {
          caseNumber: cnrNumber,
          courtName: 'Invalid CNR',
          status: 'Error',
          filingDate: 'N/A',
          petitioner: 'N/A',
          respondent: 'N/A',
          purpose: 'Please enter a valid CNR number in the format XXCGDDYYYYNNNNNNN',
          judgeName: 'N/A'
        };
      }
      
      // Make API request to new endpoint
      const response = await axios.post(
        `${API_BASE_URL}/district-court/case`,
        { cnr: cnrNumber },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY
          }
        }
      );
      
      // Check if the response contains error
      if (response.data && response.data.error) {
        throw new Error(response.data.error || 'Failed to fetch case status');
      }
      
      // Parse the response data
      const data = response.data;
      
      // If no data or case not found
      if (!data || data.status === 'error' || !data.case) {
        return {
          caseNumber: cnrNumber,
          courtName: 'Information Not Available',
          status: 'Not Found',
          filingDate: 'N/A',
          petitioner: 'N/A',
          respondent: 'N/A',
          lastHearingDate: 'N/A',
          nextHearingDate: 'N/A',
          purpose: data.message || 'Case details not found for the provided CNR number',
          judgeName: 'N/A'
        };
      }
      
      // Extract case details from the response
      return {
        caseNumber: data.case.caseNumber || cnrNumber,
        courtName: data.case.courtName || 'Unknown Court',
        status: data.case.status || 'Unknown',
        filingDate: data.case.filingDate || 'Unknown',
        petitioner: data.case.petitionerName || 'Unknown',
        respondent: data.case.respondentName || 'Unknown',
        lastHearingDate: data.case.lastHearingDate || undefined,
        nextHearingDate: data.case.nextHearingDate || undefined,
        purpose: data.case.purpose || undefined,
        judgeName: data.case.judgeName || undefined
      };
    } catch (error) {
      console.error('Error fetching district court case status:', error);
      
      // Return formatted error response
      return {
        caseNumber: cnrNumber,
        courtName: 'Error',
        status: 'Error',
        filingDate: 'N/A',
        petitioner: 'N/A',
        respondent: 'N/A',
        purpose: 'An error occurred while fetching case data. Please try again.',
        judgeName: 'N/A'
      };
    }
  }

  async getHighCourtCaseStatus(cnrNumber: string): Promise<CaseDetails> {
    try {
      console.log(`Fetching high court case status for CNR: ${cnrNumber}`);
      
      // Validate CNR number format first
      if (!isValidCNR(cnrNumber)) {
        return {
          caseNumber: cnrNumber,
          courtName: 'Invalid CNR',
          status: 'Error',
          filingDate: 'N/A',
          petitioner: 'N/A',
          respondent: 'N/A',
          purpose: 'Please enter a valid CNR number',
          judgeName: 'N/A'
        };
      }
      
      // Make API request to new endpoint
      const response = await axios.post(
        `${API_BASE_URL}/high-court/case`,
        { cnr: cnrNumber },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY
          }
        }
      );
      
      // Check if the response contains error
      if (response.data && response.data.error) {
        throw new Error(response.data.error || 'Failed to fetch high court case status');
      }
      
      // Parse the response data
      const data = response.data;
      
      // If no data or case not found
      if (!data || data.status === 'error' || !data.case) {
        return {
          caseNumber: cnrNumber,
          courtName: 'Information Not Available',
          status: 'Not Found',
          filingDate: 'N/A',
          petitioner: 'N/A',
          respondent: 'N/A',
          lastHearingDate: 'N/A',
          nextHearingDate: 'N/A',
          purpose: data.message || 'Case details not found for the provided CNR number',
          judgeName: 'N/A'
        };
      }
      
      // Extract case details from the response
      return {
        caseNumber: data.case.caseNumber || cnrNumber,
        courtName: data.case.courtName || 'Unknown High Court',
        status: data.case.status || 'Unknown',
        filingDate: data.case.filingDate || 'Unknown',
        petitioner: data.case.petitionerName || 'Unknown',
        respondent: data.case.respondentName || 'Unknown',
        lastHearingDate: data.case.lastHearingDate || undefined,
        nextHearingDate: data.case.nextHearingDate || undefined,
        purpose: data.case.purpose || undefined,
        judgeName: data.case.judgeName || undefined
      };
    } catch (error) {
      console.error('Error fetching high court case status:', error);
      
      // Return formatted error response
      return {
        caseNumber: cnrNumber,
        courtName: 'Error',
        status: 'Error',
        filingDate: 'N/A',
        petitioner: 'N/A',
        respondent: 'N/A',
        purpose: 'An error occurred while fetching high court case data. Please try again.',
        judgeName: 'N/A'
      };
    }
  }

  async getSupremeCourtCaseStatus(params: SupremeCourtCaseParams): Promise<CaseDetails> {
    try {
      console.log(`Fetching supreme court case status for Diary Number: ${params.diaryNumber}, Year: ${params.year}`);
      
      // Make API request to new endpoint
      const response = await axios.post(
        `${API_BASE_URL}/supreme-court/case`,
        { 
          diaryNumber: params.diaryNumber,
          year: params.year
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY
          }
        }
      );
      
      // Check if the response contains error
      if (response.data && response.data.error) {
        throw new Error(response.data.error || 'Failed to fetch supreme court case status');
      }
      
      // Parse the response data
      const data = response.data;
      
      // If no data or case not found
      if (!data || data.status === 'error' || !data.case) {
        return {
          caseNumber: `${params.diaryNumber}/${params.year}`,
          courtName: 'Supreme Court of India',
          status: 'Not Found',
          filingDate: 'N/A',
          petitioner: 'N/A',
          respondent: 'N/A',
          lastHearingDate: 'N/A',
          nextHearingDate: 'N/A',
          purpose: data.message || 'Case details not found for the provided diary number and year',
          judgeName: 'N/A'
        };
      }
      
      // Extract case details from the response
      return {
        caseNumber: data.case.caseNumber || `${params.diaryNumber}/${params.year}`,
        courtName: 'Supreme Court of India',
        status: data.case.status || 'Unknown',
        filingDate: data.case.filingDate || 'Unknown',
        petitioner: data.case.petitionerName || 'Unknown',
        respondent: data.case.respondentName || 'Unknown',
        lastHearingDate: data.case.lastHearingDate || undefined,
        nextHearingDate: data.case.nextHearingDate || undefined,
        purpose: data.case.purpose || undefined,
        judgeName: data.case.judgeName || undefined
      };
    } catch (error) {
      console.error('Error fetching supreme court case status:', error);
      
      // Return formatted error response
      return {
        caseNumber: `${params.diaryNumber}/${params.year}`,
        courtName: 'Supreme Court of India',
        status: 'Error',
        filingDate: 'N/A',
        petitioner: 'N/A',
        respondent: 'N/A',
        purpose: 'An error occurred while fetching supreme court case data. Please try again.',
        judgeName: 'N/A'
      };
    }
  }

  // Add more methods for different endpoints if needed
  async getCourtOrders(caseNumber: string, courtType: 'district' | 'high'): Promise<any[]> {
    console.log(`Fetching court orders for ${courtType} court, case: ${caseNumber}`);
    
    try {
      // Not implemented in the current API information
      // This is a placeholder for future implementation
      return [];
    } catch (error) {
      console.error(`Error fetching court orders for ${courtType} court:`, error);
      return [];
    }
  }

  async getCauseList(date: string, courtId: string, courtType: 'district' | 'high'): Promise<any[]> {
    console.log(`Fetching cause list for ${courtType} court ID ${courtId} on ${date}`);
    
    try {
      // Not implemented in the current API information
      // This is a placeholder for future implementation
      return [];
    } catch (error) {
      console.error(`Error fetching cause list for ${courtType} court:`, error);
      return [];
    }
  }
}

export const eCourtService = new ECourtService();
