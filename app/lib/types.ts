// 数据库模型类型定义

export interface Company {
  id: string;
  name: string;
  name_zh: string | null;
  country: string | null;
  address: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  business_type: string | null;
  established_year: number | null;
  employee_count: string | null;
  description: string | null;
  description_zh: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FDARegistration {
  id: string;
  company_id: string;
  fei_number: string | null;
  registration_number: string | null;
  owner_operator_number: string | null;
  registration_status: string | null;
  registration_date: string | null;
  expiration_date: string | null;
  product_code: string | null;
  device_class: string | null;
  device_name: string | null;
  device_description: string | null;
  regulation_number: string | null;
  establishment_type: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  source_url: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface NMPARegistration {
  id: string;
  company_id: string;
  registration_number: string;
  product_name: string | null;
  product_name_zh: string | null;
  manufacturer: string | null;
  manufacturer_zh: string | null;
  manufacturer_address: string | null;
  registration_holder: string | null;
  registration_holder_zh: string | null;
  registration_holder_address: string | null;
  device_classification: string | null;
  approval_date: string | null;
  expiration_date: string | null;
  product_description: string | null;
  scope_of_application: string | null;
  source_url: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface EUDAMEDRegistration {
  id: string;
  company_id: string;
  actor_id: string | null;
  actor_type: string | null;
  actor_name: string | null;
  actor_name_en: string | null;
  actor_address: string | null;
  country: string | null;
  srn: string | null;
  registration_status: string | null;
  registration_date: string | null;
  device_name: string | null;
  device_description: string | null;
  udi_di: string | null;
  nca: string | null;
  notified_body: string | null;
  certificate_number: string | null;
  source_url: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PMDARegistration {
  id: string;
  company_id: string;
  approval_number: string;
  product_name: string | null;
  product_name_jp: string | null;
  manufacturer: string | null;
  manufacturer_jp: string | null;
  manufacturer_address: string | null;
  marketing_authorization_holder: string | null;
  marketing_authorization_holder_jp: string | null;
  device_classification: string | null;
  approval_date: string | null;
  expiration_date: string | null;
  product_description: string | null;
  intended_use: string | null;
  source_url: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface HealthCanadaRegistration {
  id: string;
  company_id: string;
  device_identifier: string;
  company_name: string | null;
  device_name: string | null;
  device_name_fr: string | null;
  device_class: string | null;
  licence_number: string | null;
  licence_status: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  device_description: string | null;
  intended_use: string | null;
  source_url: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  name: string;
  name_zh: string | null;
  description: string | null;
  description_zh: string | null;
  category: string | null;
  intended_use: string | null;
  model_number: string | null;
  brand_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyWithRegistrations extends Company {
  fda_registrations: FDARegistration[];
  nmpa_registrations: NMPARegistration[];
  eudamed_registrations: EUDAMEDRegistration[];
  pmda_registrations: PMDARegistration[];
  health_canada_registrations: HealthCanadaRegistration[];
  products: Product[];
}

export interface SearchResult {
  companies: Company[];
  total: number;
  page: number;
  pageSize: number;
}

// 数据源统计信息
export interface DataSourceStats {
  source: string;
  count: number;
  lastUpdated: string;
  icon: string;
  color: string;
}
