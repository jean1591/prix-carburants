export interface Response {
  nhits: number;
  parameters: Parameters;
  records: Record[];
}

export interface Parameters {
  dataset: string;
  rows: number;
  start: number;
  format: string;
  "geofilter.distance": string[];
  timezone: string;
}

export interface Record {
  datasetid: string;
  recordid: string;
  fields: Fields;
  geometry: Geometry;
  record_timestamp: Date;
}

export interface Fields {
  carburants_rupture_temporaire?: string;
  geom: number[];
  gazole_prix: number;
  horaires_automate_24_24: string;
  horaires?: string;
  horaires_jour?: string;
  region: string;
  sp95_rupture_debut?: Date;
  e85_rupture_debut?: Date;
  longitude: string;
  carburants_indisponibles: string;
  departement: string;
  cp: string;
  gplc_rupture_type: string;
  services_service: string;
  services: string;
  pop: string;
  gplc_rupture_debut: Date;
  rupture: string;
  ville: string;
  sp98_maj: Date;
  sp95_rupture_type?: string;
  e85_rupture_type?: string;
  prix: string;
  e10_maj: Date;
  e10_prix: number;
  gazole_maj: Date;
  adresse: string;
  e85_prix: number;
  code_departement: string;
  latitude: string;
  carburants_rupture_definitive: string;
  carburants_disponibles: string;
  e85_maj: Date;
  code_region: string;
  id: number;
  sp98_prix: number;
  dist: string;
}

export interface Geometry {
  type: string;
  coordinates: number[];
}
