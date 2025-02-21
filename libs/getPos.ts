import { PosNameResponse, PosResponse } from "./pos.type";

import posMock from "./pos.mock.json";
import posNameMock from "./posName.mock.json";

const getPosUrl = (latitude: number, longitude: number) =>
  `https://data.economie.gouv.fr/api/records/1.0/search/?dataset=prix-des-carburants-en-france-flux-instantane-v2&geofilter.distance=${latitude},${longitude},5000`;

const getPosNameUrl = (posId: number) =>
  `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/prix-des-carburants-j-1/records?where=id="${posId}"&limit=1&select=id,brand`;

export const getPosByLatitudeAndLongitude = async (
  latitude: number,
  longitude: number
): Promise<PosResponse> => {
  const url = getPosUrl(latitude, longitude);

  /* const response = await fetch(url);
  const data = (await response.json()) as PosResponse; */
  const data = posMock as unknown as PosResponse;

  const hydratedPos = await Promise.all(
    data.records.map(async (record) => ({
      ...record,
      fields: {
        ...record.fields,
        name: await getPosName(record.fields.id),
      },
    }))
  );

  return { ...data, records: hydratedPos };
};

const getPosName = async (posId: number): Promise<string> => {
  const url = getPosNameUrl(posId);

  /* const response = await fetch(url);
  const data = (await response.json()) as PosNameResponse; */
  const data = posNameMock as PosNameResponse;

  const name = data.results[0].brand;

  if (!name) {
    return "";
  }

  return name;
};
