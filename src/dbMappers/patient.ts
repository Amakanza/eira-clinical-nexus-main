import { Patient } from "@/types/clinical";

export function mapPatientToDb(p: Patient) {
  return {
    mrn: p.mrn,
    first_name: p.firstName,
    last_name: p.lastName,
    date_of_birth: p.dateOfBirth,       // "YYYY-MM-DD"
    gender: p.gender,
    id_number: p.idNumber,

    phone: p.phone ?? null,
    cell_number: p.cellNumber ?? null,
    email: p.email ?? null,
    occupation: p.occupation ?? null,
    dependent_code: p.dependentCode ?? null,

    medical_aid_name: p.medicalAidName ?? null,
    medical_aid_number: p.medicalAidNumber ?? null,
    medical_aid_id: p.medicalAidId ?? null,
    main_member_id_number: p.mainMemberIdNumber ?? null,
    bank: p.bank ?? null,
    bank_account_number: p.bankAccountNumber ?? null,
    main_member_occupation: p.mainMemberOccupation ?? null,
    employer_name: p.employerName ?? null,
    referring_doctor: p.referringDoctor ?? null,
    family_doctor: p.familyDoctor ?? null,

    street: (p as any).street ?? null,
    suburb: (p as any).suburb ?? null,
    city: (p as any).city ?? null,
    postal_code: (p as any).postalCode ?? null,
    region: (p as any).region ?? null,

    is_archived: !!p.isArchived,
  };
}
