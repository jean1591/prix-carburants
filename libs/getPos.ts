import { PosNameResponse, PosResponse } from "./pos.type";

import { ValidParams } from "./getPos.type";
import posMock from "./pos.mock.json";
import posNameMock from "./posName.mock.json";

const getPosByCityUrl = (city: string) =>
  `https://data.economie.gouv.fr/api/records/1.0/search/?dataset=prix-des-carburants-en-france-flux-instantane-v2&refine.ville=${city}`;

const getPosByCoordinatesUrl = (latitude: number, longitude: number) =>
  `https://data.economie.gouv.fr/api/records/1.0/search/?dataset=prix-des-carburants-en-france-flux-instantane-v2&geofilter.distance=${latitude},${longitude},5000`;

const getPosNameUrl = (posId: number) =>
  `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/prix-des-carburants-j-1/records?where=id="${posId}"&limit=1&select=id,brand`;

export const getPos = async (params: ValidParams): Promise<PosResponse> => {
  let url: string | undefined = undefined;

  if (params.coordinates) {
    const {
      coordinates: { latitude, longitude },
    } = params;

    url = getPosByCoordinatesUrl(latitude, longitude);
  }

  if (params.city) {
    const { city } = params;

    url = getPosByCityUrl(city);
  }

  if (!url) {
    throw new Error("URL was not defined by either a city or coordinates");
  }

  const response = await fetch(url);
  const data = (await response.json()) as PosResponse;
  // const data = posMock as unknown as PosResponse;

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

  const response = await fetch(url);
  const data = (await response.json()) as PosNameResponse;
  // const data = posNameMock as PosNameResponse;

  const name = data.results[0].brand;

  if (!name) {
    return "";
  }

  return name;
};
