interface Params {
  coordinates?: { latitude: number; longitude: number };
  city?: string;
}

type RequiredParam =
  | { coordinates: { latitude: number; longitude: number } }
  | { city: string };

export type ValidParams = Params & RequiredParam;
