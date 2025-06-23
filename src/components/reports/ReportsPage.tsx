
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, FileText, User } from 'lucide-react';
import { usePatients, useGenerateReport, useDownloadReport, type ReportData } from '@/hooks/useReports';

const ReportsPage = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [reportType, setReportType] = useState<'general' | 'mva'>('general');
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);

  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const generateReport = useGenerateReport();
  const downloadReport = useDownloadReport();

  const handleGenerateReport = async () => {
    if (!selectedPatient) return;

    try {
      const report = await generateReport.mutateAsync({
        type: reportType,
        id: selectedPatient
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

  const selectedPatientData = patients.find(p => p.id === selectedPatient || p.case_number === selectedPatient);

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
              Select a patient and report type to generate a comprehensive report
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patientsLoading ? (
                    <SelectItem value="loading" disabled>Loading patients...</SelectItem>
                  ) : patients.length === 0 ? (
                    <SelectItem value="no-patients" disabled>No patients available</SelectItem>
                  ) : (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.patient_name} {patient.case_number && `(${patient.case_number})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

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
              disabled={!selectedPatient || selectedPatient === 'loading' || selectedPatient === 'no-patients' || generateReport.isPending}
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
                  <Badge variant="secondary">
                    {reportType === 'general' ? 'General Report' : 'MVA Report'}
                  </Badge>
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
            Patients in the system available for report generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patientsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading patients...</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No patients found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((patient) => (
                <div key={patient.id} className="p-3 border rounded-lg">
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
