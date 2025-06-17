
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, X } from 'lucide-react';
import { ICD10Code, Diagnosis } from '@/types/clinical';

// Sample ICD-10 codes - in a real app, this would come from a database
const sampleICD10Codes: ICD10Code[] = [
  { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular' },
  { code: 'E11', description: 'Type 2 diabetes mellitus', category: 'Endocrine' },
  { code: 'J44', description: 'Chronic obstructive pulmonary disease', category: 'Respiratory' },
  { code: 'M79.1', description: 'Myalgia', category: 'Musculoskeletal' },
  { code: 'R50', description: 'Fever, unspecified', category: 'Symptoms' },
  { code: 'K59.00', description: 'Constipation, unspecified', category: 'Digestive' },
  { code: 'G43', description: 'Migraine', category: 'Neurological' },
  { code: 'F32', description: 'Major depressive disorder, single episode', category: 'Mental Health' },
  { code: 'L30', description: 'Other and unspecified dermatitis', category: 'Skin' },
  { code: 'H10', description: 'Conjunctivitis', category: 'Eye' }
];

interface ICD10LookupProps {
  diagnoses: Diagnosis[];
  onAddDiagnosis: (diagnosis: Omit<Diagnosis, 'id' | 'dateAdded' | 'addedBy'>) => void;
  onRemoveDiagnosis: (diagnosisId: string) => void;
}

export const ICD10Lookup = ({ diagnoses, onAddDiagnosis, onRemoveDiagnosis }: ICD10LookupProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCodes, setFilteredCodes] = useState<ICD10Code[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = sampleICD10Codes.filter(
        code =>
          code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          code.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCodes(filtered);
      setShowResults(true);
    } else {
      setFilteredCodes([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const handleAddDiagnosis = (code: ICD10Code) => {
    const existingDiagnosis = diagnoses.find(d => d.icd10Code === code.code);
    if (!existingDiagnosis) {
      onAddDiagnosis({
        icd10Code: code.code,
        description: code.description
      });
    }
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-600">Search ICD-10 Diagnoses</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ICD-10 code or description..."
            className="pl-10"
          />
          
          {showResults && filteredCodes.length > 0 && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
              <CardContent className="p-2">
                {filteredCodes.map((code) => (
                  <div
                    key={code.code}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => handleAddDiagnosis(code)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{code.code}</div>
                      <div className="text-sm text-gray-600">{code.description}</div>
                      {code.category && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {code.category}
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {diagnoses.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-600">Current Diagnoses</label>
          <div className="space-y-2 mt-2">
            {diagnoses.map((diagnosis) => (
              <div
                key={diagnosis.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{diagnosis.icd10Code}</div>
                  <div className="text-sm text-gray-600">{diagnosis.description}</div>
                  <div className="text-xs text-gray-500">
                    Added: {new Date(diagnosis.dateAdded).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveDiagnosis(diagnosis.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
