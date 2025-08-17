
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Download, FileText, User, Search, CalendarIcon, Check } from 'lucide-react';
import { useSupabasePatients } from '@/hooks/useSupabasePatients';
import { useGenerateReport, useDownloadReport, type ReportData } from '@/hooks/useReports';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ReportsPage = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [reportType, setReportType] = useState<'general' | 'mva'>('general');
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { patients, isLoading: patientsLoading } = useSupabasePatients();
  const generateReport = useGenerateReport();
  const downloadReport = useDownloadReport();

  // Filter patients based on search term for suggestions
  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.patient_name.toLowerCase().includes(searchLower) ||
      patient.case_number?.toLowerCase().includes(searchLower) ||
      patient.diagnosis?.toLowerCase().includes(searchLower) ||
      patient.physiotherapist?.toLowerCase().includes(searchLower)
    );
  }).slice(0, 8); // Limit to 8 suggestions

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        suggestionsRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
    if (value.length === 0) {
      setSelectedPatient('');
    }
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient.id);
    setSearchTerm(patient.patient_name);
    setShowSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (searchTerm.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedPatient) return;

    try {
      const report = await generateReport.mutateAsync({
        type: reportType,
        id: selectedPatient,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined
      });
      setGeneratedReport(report);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleDownloadReport = async () => {
    if (!generatedReport || !selectedPatient) return;

    const patient = patients.find(p => p.id === selectedPatient || p.case_number === selectedPatient);
    if (!patient) return;

    await downloadReport.mutateAsync({
      reportData: generatedReport,
      type: reportType,
      patientName: patient.patient_name
    });
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Reports Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Search for a patient, select report type, and date range to generate a comprehensive report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={(value: 'general' | 'mva') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Patient Report</SelectItem>
                  <SelectItem value="mva">MVA Initial Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Patient Search with Autocomplete */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search & Select Patient</label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Type patient name, case number, diagnosis, or therapist..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={handleSearchFocus}
                    className={cn(
                      "pl-10",
                      selectedPatient && "border-green-500 bg-green-50"
                    )}
                  />
                  {selectedPatient && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                  )}
                </div>
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && filteredPatients.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  >
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={cn(
                          "px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0",
                          selectedPatient === patient.id && "bg-blue-50 border-blue-200"
                        )}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{patient.patient_name}</div>
                            <div className="text-xs text-gray-500 space-x-2">
                              {patient.case_number && (
                                <span>Case: {patient.case_number}</span>
                              )}
                              {patient.diagnosis && (
                                <span>• {patient.diagnosis}</span>
                              )}
                            </div>
                            {patient.physiotherapist && (
                              <div className="text-xs text-blue-600">
                                Therapist: {patient.physiotherapist}
                              </div>
                            )}
                          </div>
                          {selectedPatient === patient.id && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showSuggestions && searchTerm && filteredPatients.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                    <div className="text-sm text-gray-500 text-center">
                      No patients found matching "{searchTerm}"
                    </div>
                  </div>
                )}
              </div>
              
              {selectedPatient && selectedPatientData && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Selected: {selectedPatientData.patient_name}
                </div>
              )}
            </div>

            {/* Date Range Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {(startDate || endDate) && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                <strong>Date Range:</strong> {startDate ? format(startDate, "MMM dd, yyyy") : "Start"} → {endDate ? format(endDate, "MMM dd, yyyy") : "End"}
                {startDate && endDate && startDate > endDate && (
                  <div className="text-red-600 mt-1">⚠️ Start date should be before end date</div>
                )}
              </div>
            )}

            {selectedPatientData && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{selectedPatientData.patient_name}</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {selectedPatientData.case_number && (
                    <div>Case: {selectedPatientData.case_number}</div>
                  )}
                  {selectedPatientData.diagnosis && (
                    <div>Diagnosis: {selectedPatientData.diagnosis}</div>
                  )}
                  {selectedPatientData.physiotherapist && (
                    <div>Therapist: {selectedPatientData.physiotherapist}</div>
                  )}
                </div>
              </div>
            )}

            <Button 
              onClick={handleGenerateReport}
              disabled={!selectedPatient || selectedPatient === 'loading' || selectedPatient === 'no-patients' || generateReport.isPending || (startDate && endDate && startDate > endDate)}
              className="w-full"
            >
              {generateReport.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              Preview and download the generated report
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedReport ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {reportType === 'general' ? 'General Report' : 'MVA Report'}
                    </Badge>
                    {(startDate || endDate) && (
                      <Badge variant="outline">
                        {startDate ? format(startDate, "MMM dd") : "Start"} - {endDate ? format(endDate, "MMM dd") : "End"}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    onClick={handleDownloadReport}
                    disabled={downloadReport.isPending}
                    size="sm"
                  >
                    {downloadReport.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(generatedReport, null, 2)}
                  </pre>
                </div>

                <div className="text-xs text-muted-foreground">
                  Note: In production, this would generate a properly formatted Word document 
                  with grammar checking via LanguageTool integration.
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate a report to see the preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Patients */}
      <Card>
        <CardHeader>
          <CardTitle>Available Patients</CardTitle>
          <CardDescription>
            {searchTerm ? `Patients matching "${searchTerm}"` : 'Patients in the system available for report generation'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patientsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading patients...</span>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{searchTerm ? 'No patients found matching your search' : 'No patients found'}</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-colors",
                    selectedPatient === patient.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedPatient(patient.id)}
                >
                  <div className="font-medium">{patient.patient_name}</div>
                  {patient.case_number && (
                    <div className="text-sm text-muted-foreground">
                      Case: {patient.case_number}
                    </div>
                  )}
                  {patient.diagnosis && (
                    <div className="text-sm text-muted-foreground">
                      {patient.diagnosis}
                    </div>
                  )}
                  {patient.physiotherapist && (
                    <div className="text-xs text-muted-foreground">
                      Therapist: {patient.physiotherapist}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
