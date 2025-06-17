
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ICD10Lookup } from './ICD10Lookup';
import { Patient, Diagnosis } from '@/types/clinical';

const patientSchema = z.object({
  // Basic Information
  mrn: z.string().min(1, 'Medical Record Number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  idNumber: z.string().min(1, 'ID number is required'),
  phone: z.string().optional(),
  cellNumber: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  occupation: z.string().optional(),
  dependentCode: z.string().optional(),

  // Main Member Details
  medicalAidName: z.string().optional(),
  medicalAidNumber: z.string().optional(),
  medicalAidId: z.string().optional(),
  mainMemberIdNumber: z.string().optional(),
  bank: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  mainMemberOccupation: z.string().optional(),
  employerName: z.string().optional(),
  referringDoctor: z.string().optional(),
  familyDoctor: z.string().optional(),

  // Address
  street: z.string().optional(),
  city: z.string().optional(),

  // Next of Kin 1
  nextOfKin1Name: z.string().optional(),
  nextOfKin1Relationship: z.string().optional(),
  nextOfKin1Phone: z.string().optional(),
  nextOfKin1IdNumber: z.string().optional(),
  nextOfKin1Email: z.string().optional(),

  // Next of Kin 2
  nextOfKin2Name: z.string().optional(),
  nextOfKin2Relationship: z.string().optional(),
  nextOfKin2Phone: z.string().optional(),
  nextOfKin2IdNumber: z.string().optional(),
  nextOfKin2Email: z.string().optional(),

  // Medical Information
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalHistory: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData & { diagnoses: Diagnosis[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PatientForm = ({ patient, onSubmit, onCancel, isLoading }: PatientFormProps) => {
  const [diagnoses, setDiagnoses] = React.useState<Diagnosis[]>(patient?.diagnoses || []);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      mrn: patient?.mrn || '',
      firstName: patient?.firstName || '',
      lastName: patient?.lastName || '',
      dateOfBirth: patient?.dateOfBirth || '',
      gender: patient?.gender || 'unknown',
      idNumber: patient?.idNumber || '',
      phone: patient?.phone || '',
      cellNumber: patient?.cellNumber || '',
      email: patient?.email || '',
      occupation: patient?.occupation || '',
      dependentCode: patient?.dependentCode || '',
      
      // Main Member
      medicalAidName: patient?.mainMember?.medicalAidName || '',
      medicalAidNumber: patient?.mainMember?.medicalAidNumber || '',
      medicalAidId: patient?.mainMember?.medicalAidId || '',
      mainMemberIdNumber: patient?.mainMember?.idNumber || '',
      bank: patient?.mainMember?.bank || '',
      bankAccountNumber: patient?.mainMember?.bankAccountNumber || '',
      mainMemberOccupation: patient?.mainMember?.occupation || '',
      employerName: patient?.mainMember?.employerName || '',
      referringDoctor: patient?.mainMember?.referringDoctor || '',
      familyDoctor: patient?.mainMember?.familyDoctor || '',
      
      // Address
      street: patient?.address?.street || '',
      city: patient?.address?.city || '',
      
      // Next of Kin
      nextOfKin1Name: patient?.nextOfKin1?.name || '',
      nextOfKin1Relationship: patient?.nextOfKin1?.relationship || '',
      nextOfKin1Phone: patient?.nextOfKin1?.phone || '',
      nextOfKin1IdNumber: patient?.nextOfKin1?.idNumber || '',
      nextOfKin1Email: patient?.nextOfKin1?.email || '',
      
      nextOfKin2Name: patient?.nextOfKin2?.name || '',
      nextOfKin2Relationship: patient?.nextOfKin2?.relationship || '',
      nextOfKin2Phone: patient?.nextOfKin2?.phone || '',
      nextOfKin2IdNumber: patient?.nextOfKin2?.idNumber || '',
      nextOfKin2Email: patient?.nextOfKin2?.email || '',
      
      // Medical
      allergies: patient?.allergies?.join(', ') || '',
      medications: patient?.medications?.join(', ') || '',
      medicalHistory: patient?.medicalHistory?.join(', ') || '',
    },
  });

  const handleAddDiagnosis = (diagnosisData: Omit<Diagnosis, 'id' | 'dateAdded' | 'addedBy'>) => {
    const newDiagnosis: Diagnosis = {
      ...diagnosisData,
      id: `diagnosis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date().toISOString(),
      addedBy: 'Current User' // In a real app, this would be the logged-in user
    };
    setDiagnoses(prev => [...prev, newDiagnosis]);
  };

  const handleRemoveDiagnosis = (diagnosisId: string) => {
    setDiagnoses(prev => prev.filter(d => d.id !== diagnosisId));
  };

  const handleSubmit = (data: PatientFormData) => {
    onSubmit({ ...data, diagnoses });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{patient ? 'Edit Patient' : 'Add New Patient'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="mainmember">Main Member</TabsTrigger>
                <TabsTrigger value="nextofkin">Next of Kin</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mrn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Record Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="MRN-12345" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="9001010000000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(021) 123-4567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cellNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cell Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="082 123 4567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="john.doe@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Software Developer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dependentCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dependent Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="mainmember" className="space-y-4">
                <h3 className="text-lg font-medium">Main Member Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="medicalAidName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Aid Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Discovery Health" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medicalAidNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Aid Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="12345678901" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="medicalAidId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Aid ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="DIS001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mainMemberIdNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Member ID Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="7001010000000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Standard Bank" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bankAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Account Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="12345678901" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mainMemberOccupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Member Occupation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Manager" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employer Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABC Company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="referringDoctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referring Doctor</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Dr. Smith" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="familyDoctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Doctor</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Dr. Johnson" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="nextofkin" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Next of Kin 1</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nextOfKin1Name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Jane Doe" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nextOfKin1Relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Spouse" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="nextOfKin1Phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="082 123 4567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nextOfKin1IdNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="8001010000000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nextOfKin1Email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="jane@email.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Next of Kin 2</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nextOfKin2Name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="John Smith" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nextOfKin2Relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Brother" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="nextOfKin2Phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="082 987 6543" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nextOfKin2IdNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="7501010000000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nextOfKin2Email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="john@email.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <h3 className="text-lg font-medium">Address Information</h3>
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main St" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Cape Town" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="medical" className="space-y-4">
                <h3 className="text-lg font-medium">Medical Information</h3>
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Penicillin, Shellfish" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Medications (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Aspirin 81mg daily, Lisinopril 10mg daily" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical History (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Hypertension, Diabetes Type 2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="diagnosis" className="space-y-4">
                <h3 className="text-lg font-medium">ICD-10 Diagnoses</h3>
                <ICD10Lookup
                  diagnoses={diagnoses}
                  onAddDiagnosis={handleAddDiagnosis}
                  onRemoveDiagnosis={handleRemoveDiagnosis}
                />
              </TabsContent>
            </Tabs>

            <div className="flex space-x-4 pt-6 border-t">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (patient ? 'Update Patient' : 'Add Patient')}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
