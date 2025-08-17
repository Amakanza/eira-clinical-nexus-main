
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Archive, User, Phone, Mail, MapPin, AlertTriangle, Pill, FileText, CreditCard } from 'lucide-react';
import { Patient } from '@/types/clinical';

interface PatientDetailsProps {
  patient: Patient;
  onEdit: () => void;
  onArchive: () => void;
  onBack: () => void;
  onCreateNote: () => void;
}

export const PatientDetails = ({ patient, onEdit, onArchive, onBack, onCreateNote }: PatientDetailsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'deceased':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
          <h1 className="text-2xl font-bold">
            {patient.firstName} {patient.lastName}
          </h1>
          <Badge className={getStatusColor(patient.status)}>
            {patient.status}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </Button>
          <Button onClick={onCreateNote}>
            <FileText className="h-4 w-4 mr-2" />
            Create SOAP Note
          </Button>
          {patient.status === 'active' && (
            <Button variant="outline" onClick={onArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Medical Record Number</label>
                <p className="text-lg font-semibold">{patient.mrn}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <p className="capitalize">{patient.gender}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Birth</label>
              <p>{formatDate(patient.dateOfBirth)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">ID Number</label>
              <p>{patient.idNumber}</p>
            </div>
            {patient.occupation && (
              <div>
                <label className="text-sm font-medium text-gray-600">Occupation</label>
                <p>{patient.occupation}</p>
              </div>
            )}
            {patient.dependentCode && (
              <div>
                <label className="text-sm font-medium text-gray-600">Dependent Code</label>
                <p>{patient.dependentCode}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">Last Visit</label>
              <p>{patient.lastVisit ? formatDate(patient.lastVisit) : 'Never'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span>{patient.phone}</span>
              </div>
            )}
            {patient.cellNumber && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span>{patient.cellNumber} (Cell)</span>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span>{patient.email}</span>
              </div>
            )}
            {patient.address && (
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-600 mt-1" />
                <div>
                  <p>{patient.address.street}</p>
                  <p>{patient.address.city}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Member Information */}
        {patient.mainMember && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Medical Aid Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Medical Aid Name</label>
                <p className="font-semibold">{patient.mainMember.medicalAidName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Medical Aid Number</label>
                <p className="text-lg font-semibold text-blue-600">{patient.mainMember.medicalAidNumber}</p>
              </div>
              {patient.mainMember.medicalAidId && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Medical Aid ID</label>
                  <p>{patient.mainMember.medicalAidId}</p>
                </div>
              )}
              {patient.mainMember.referringDoctor && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Referring Doctor</label>
                  <p>{patient.mainMember.referringDoctor}</p>
                </div>
              )}
              {patient.mainMember.familyDoctor && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Family Doctor</label>
                  <p>{patient.mainMember.familyDoctor}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next of Kin */}
        {(patient.nextOfKin1 || patient.nextOfKin2) && (
          <Card>
            <CardHeader>
              <CardTitle>Next of Kin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.nextOfKin1 && (
                <div>
                  <h4 className="font-medium">Next of Kin 1</h4>
                  <div className="mt-2 space-y-1">
                    <p><span className="text-sm text-gray-600">Name:</span> {patient.nextOfKin1.name}</p>
                    <p><span className="text-sm text-gray-600">Relationship:</span> {patient.nextOfKin1.relationship}</p>
                    <p><span className="text-sm text-gray-600">Phone:</span> {patient.nextOfKin1.phone}</p>
                  </div>
                </div>
              )}
              {patient.nextOfKin2 && (
                <div>
                  <h4 className="font-medium">Next of Kin 2</h4>
                  <div className="mt-2 space-y-1">
                    <p><span className="text-sm text-gray-600">Name:</span> {patient.nextOfKin2.name}</p>
                    <p><span className="text-sm text-gray-600">Relationship:</span> {patient.nextOfKin2.relationship}</p>
                    <p><span className="text-sm text-gray-600">Phone:</span> {patient.nextOfKin2.phone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Medical Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.allergies && patient.allergies.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Allergies</span>
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.medications && patient.medications.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                  <Pill className="h-4 w-4" />
                  <span>Current Medications</span>
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.medications.map((medication, index) => (
                    <Badge key={index} variant="secondary">
                      {medication}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.medicalHistory && patient.medicalHistory.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600">Medical History</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.medicalHistory.map((history, index) => (
                    <Badge key={index} variant="outline">
                      {history}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.diagnoses && patient.diagnoses.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600">Diagnoses</label>
                <div className="space-y-2 mt-1">
                  {patient.diagnoses.map((diagnosis) => (
                    <div key={diagnosis.id} className="p-2 border rounded-lg">
                      <div className="font-medium">{diagnosis.icd10Code}</div>
                      <div className="text-sm text-gray-600">{diagnosis.description}</div>
                      <div className="text-xs text-gray-500">
                        Added: {formatDate(diagnosis.dateAdded)} by {diagnosis.addedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
