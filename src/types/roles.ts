export type Detail = {
  photo: string;
  employmentType: string;
  officeLocation: string;
  notes?: string;
  employeeId?: string;
};

export type BasicInfo = {
  fullname: string;
  email: string;
  department: string;
  role: string;
  employeeId: string;
};

export type Admin = Detail & {
  fullname?: string;
  department?: string;
  role?: string;
};
