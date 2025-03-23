
import { SavedCase } from './eCourtService';

class CaseStorageService {
  private storageKey = 'saved_cases';

  getSavedCases(): SavedCase[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error reading saved cases:', error);
    }
    return [];
  }

  saveCase(caseData: Omit<SavedCase, 'id' | 'savedAt'>): SavedCase {
    const savedCases = this.getSavedCases();
    
    const newCase: SavedCase = {
      ...caseData,
      id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      savedAt: new Date().toISOString(),
    };
    
    savedCases.push(newCase);
    this.saveCases(savedCases);
    
    return newCase;
  }

  updateCase(id: string, caseData: Partial<SavedCase>): boolean {
    const savedCases = this.getSavedCases();
    const index = savedCases.findIndex(c => c.id === id);
    
    if (index === -1) return false;
    
    savedCases[index] = {
      ...savedCases[index],
      ...caseData,
    };
    
    this.saveCases(savedCases);
    return true;
  }

  deleteCase(id: string): boolean {
    const savedCases = this.getSavedCases();
    const index = savedCases.findIndex(c => c.id === id);
    
    if (index === -1) return false;
    
    savedCases.splice(index, 1);
    this.saveCases(savedCases);
    return true;
  }

  private saveCases(cases: SavedCase[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cases));
    } catch (error) {
      console.error('Error saving cases:', error);
    }
  }
}

export const caseStorageService = new CaseStorageService();
