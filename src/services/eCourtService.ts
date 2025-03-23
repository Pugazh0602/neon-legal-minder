
import axios from 'axios';

const BASE_DISTRICT_URL = 'https://services.ecourts.gov.in/ecourtindia_v6/';
const BASE_HIGH_COURT_URL = 'https://hcservices.ecourts.gov.in/hcservices/';

// App tokens for different district court endpoints
const DISTRICT_TOKENS = {
  home: '084b1b10fd14ed0de4f9b8156edfc94af851d4fb0f00bf1e9814fe7d3561d338',
  caseStatus: 'f5fb3fded8bdb3f5a867a1c0dbcd388b3075748f8b784456f7e898ea94ab4d0a',
  courtOrder: 'f3722acb2d6d9d4b219a42c72a3eae9af1674baf20232494782ca5d124fdcec0',
  causeList: 'cfe52169a28e1132ce6d3c23be8fe66af61dff05f88376b2e844ed962d55d308',
  caveatSearch: '9655600d0287be266e0a0efc45c2eaf7e89953991a146433cbb9a52673d7440d',
  location: '05f71710e6b6b8ff0cddb0df1b3513944f4f1b21b354eee10eb3234eaf23b206'
};

// Mock captcha solving function
// In a real app, this would either use a captcha solving service
// or ask the user to solve the captcha
const solveCaptcha = async (captchaImage: string): Promise<string> => {
  console.log('Solving captcha:', captchaImage);
  // In a real implementation, you would either:
  // 1. Display the captcha to the user and get their input
  // 2. Use a captcha solving service
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('MOCK_CAPTCHA_SOLUTION');
    }, 1000);
  });
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

class ECourtService {
  async getDistrictCourtCaseStatus(cnrNumber: string): Promise<CaseDetails> {
    try {
      console.log(`Fetching case status for CNR: ${cnrNumber}`);
      
      // Make actual API request to get case status by CNR
      const response = await axios.post(`${BASE_DISTRICT_URL}?p=casestatus/getCaseStatusByCNR`, 
        { 
          cnr: cnrNumber,
          captcha: 'MOCK_CAPTCHA_SOLUTION' // In a real implementation, this would be solved by the user
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'app_token': DISTRICT_TOKENS.caseStatus,
            'Accept': 'application/json'
          }
        }
      );
      
      // Check if the response contains error or not
      if (response.data && response.data.error) {
        throw new Error(response.data.error || 'Failed to fetch case status');
      }
      
      // Parse the response data
      // Note: This is a simplified version; in a real implementation, 
      // you would need to adapt to the actual API response structure
      const data = response.data;
      
      // If no data or CNR not found
      if (!data || !data.case_details) {
        // If the API doesn't find the case, return a fallback with an appropriate message
        return {
          caseNumber: cnrNumber,
          courtName: 'Information Not Available',
          status: 'Not Found',
          filingDate: 'N/A',
          petitioner: 'N/A',
          respondent: 'N/A',
          lastHearingDate: 'N/A',
          nextHearingDate: 'N/A',
          purpose: 'Case details not found for the provided CNR number',
          judgeName: 'N/A'
        };
      }
      
      // Extract case details from the response
      return {
        caseNumber: data.case_details.case_number || cnrNumber,
        courtName: data.case_details.court_name || 'Unknown Court',
        status: data.case_details.case_status || 'Unknown',
        filingDate: data.case_details.filing_date || 'Unknown',
        petitioner: data.case_details.petitioner_name || 'Unknown',
        respondent: data.case_details.respondent_name || 'Unknown',
        lastHearingDate: data.case_details.last_hearing_date || undefined,
        nextHearingDate: data.case_details.next_hearing_date || undefined,
        purpose: data.case_details.purpose || undefined,
        judgeName: data.case_details.judge_name || undefined
      };
    } catch (error) {
      console.error('Error fetching case status:', error);
      
      // For better user experience, return a formatted error object instead of throwing
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
      
      // Make actual API request to get high court case status by CNR
      const response = await axios.post(`${BASE_HIGH_COURT_URL}/main.php`, 
        { 
          module: 'get_case_status',
          cnr: cnrNumber,
          captcha: 'MOCK_CAPTCHA_SOLUTION' // In a real implementation, this would be solved by the user
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      // Check if the response contains error or not
      if (response.data && response.data.error) {
        throw new Error(response.data.error || 'Failed to fetch high court case status');
      }
      
      // Parse the response data
      const data = response.data;
      
      // If no data or CNR not found
      if (!data || !data.case_details) {
        // Fallback for not found case
        return {
          caseNumber: cnrNumber,
          courtName: 'Information Not Available',
          status: 'Not Found',
          filingDate: 'N/A',
          petitioner: 'N/A',
          respondent: 'N/A',
          lastHearingDate: 'N/A',
          nextHearingDate: 'N/A',
          purpose: 'Case details not found for the provided CNR number',
          judgeName: 'N/A'
        };
      }
      
      // Extract case details from the response
      return {
        caseNumber: data.case_details.case_number || cnrNumber,
        courtName: data.case_details.court_name || 'Unknown High Court',
        status: data.case_details.case_status || 'Unknown',
        filingDate: data.case_details.filing_date || 'Unknown',
        petitioner: data.case_details.petitioner_name || 'Unknown',
        respondent: data.case_details.respondent_name || 'Unknown',
        lastHearingDate: data.case_details.last_hearing_date || undefined,
        nextHearingDate: data.case_details.next_hearing_date || undefined,
        purpose: data.case_details.purpose || undefined,
        judgeName: data.case_details.judge_name || undefined
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

  // Add more methods for different endpoints
  async getCourtOrders(caseNumber: string, courtType: 'district' | 'high'): Promise<any[]> {
    console.log(`Fetching court orders for ${courtType} court, case: ${caseNumber}`);
    
    try {
      let response;
      
      if (courtType === 'district') {
        response = await axios.post(
          `${BASE_DISTRICT_URL}?p=courtorder/getCourtOrders`,
          { 
            case_no: caseNumber,
            captcha: 'MOCK_CAPTCHA_SOLUTION' 
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'app_token': DISTRICT_TOKENS.courtOrder,
              'Accept': 'application/json'
            }
          }
        );
      } else {
        response = await axios.post(
          `${BASE_HIGH_COURT_URL}/main.php`,
          { 
            module: 'get_court_orders',
            case_no: caseNumber,
            captcha: 'MOCK_CAPTCHA_SOLUTION' 
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
      }
      
      if (response.data && response.data.orders) {
        return response.data.orders.map((order: any) => ({
          orderId: order.order_id || 'Unknown',
          date: order.order_date || 'Unknown',
          type: order.order_type || 'Unknown',
          document: order.document_url || null,
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching court orders for ${courtType} court:`, error);
      return [];
    }
  }

  async getCauseList(date: string, courtId: string, courtType: 'district' | 'high'): Promise<any[]> {
    console.log(`Fetching cause list for ${courtType} court ID ${courtId} on ${date}`);
    
    try {
      let response;
      
      if (courtType === 'district') {
        response = await axios.post(
          `${BASE_DISTRICT_URL}?p=cause_list/getCauseList`,
          { 
            date: date,
            court_id: courtId,
            captcha: 'MOCK_CAPTCHA_SOLUTION' 
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'app_token': DISTRICT_TOKENS.causeList,
              'Accept': 'application/json'
            }
          }
        );
      } else {
        response = await axios.post(
          `${BASE_HIGH_COURT_URL}/main.php`,
          { 
            module: 'get_cause_list',
            date: date,
            court_id: courtId,
            captcha: 'MOCK_CAPTCHA_SOLUTION' 
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
      }
      
      if (response.data && response.data.cause_list) {
        return response.data.cause_list.map((item: any) => ({
          serialNo: item.sr_no || 'Unknown',
          caseNumber: item.case_no || 'Unknown',
          parties: item.parties || 'Unknown',
          purpose: item.purpose || 'Unknown'
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching cause list for ${courtType} court:`, error);
      return [];
    }
  }
}

export const eCourtService = new ECourtService();
