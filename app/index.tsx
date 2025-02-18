import * as Location from "expo-location";

import { Fields, Response } from "@/libs/pos.type";
import { ScrollView, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import mock from "./mock.json";

const getUrl = (latitude: number, longitude: number) =>
  `https://data.economie.gouv.fr/api/records/1.0/search/?dataset=prix-des-carburants-en-france-flux-instantane-v2&geofilter.distance=${latitude},${longitude},5000`;

export default function Index() {
  const [location, setLocation] = useState<
    { latitude: number; longitude: number } | undefined
  >();
  const [pointsOfSale, setPointsOfSale] = useState<Response | undefined>(
    mock as unknown as Response
  );

  /* useEffect(() => {
    const getPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        console.error(`Permissions are granted: ${status}`);

        return;
      }

      let {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({});
      setLocation({ latitude, longitude });
      console.log("🚀 ~ permission ~ coordonates:", { latitude, longitude });
    };

    getPermission();
  }, []);

  useEffect(() => {
    const getData = async (latitude: number, longitude: number) => {
      const url = getUrl(latitude, longitude);

      const response = await fetch(url);
      const data = (await response.json()) as Response;
      console.log("🚀 ~ getData ~ data:", data);

      setPointsOfSale(data);
    };

    if (location && location.latitude && location.longitude) {
      getData(location.latitude, location.longitude);
    }
  }, [location]); */

  return (
    <SafeAreaView className="bg-white h-full px-5">
      <ScrollView contentContainerClassName="h-full">
        {pointsOfSale && (
          <View className="flex flex-col gap-5">
            {pointsOfSale.records.map(({ recordid, fields }) => (
              <PointOfSale key={recordid} fields={fields} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const PointOfSale = ({ fields }: { fields: Fields }) => {
  return (
    <View className="bg-primary-100 rounded-xl p-4">
      <Text className="uppercase text-2xl font-rubik-bold tracking-tight leading-tight">
        {fields.adresse}
      </Text>
      <Text className="mt-1 text-lg font-rubik-bold tracking-tight leading-tight">
        {fields.ville} {fields.cp}
      </Text>

      <View className="w-full items-center justify-start mt-8 flex flex-row gap-2 flex-wrap">
        {JSON.parse(fields.prix).map((prix) => (
          <View
            key={prix["@id"]}
            className="basis-1/3 flex-1 bg-primary-200 rounded-xl p-4"
          >
            <Text className="text-xl font-rubik-bold">{prix["@valeur"]}€</Text>
            <Text className="text-sm">{prix["@nom"]}</Text>
          </View>
        ))}
      </View>

      <View className="mt-8 flex flex-row gap-2 flex-wrap">
        {fields.services_service &&
          fields.services_service.split("//").map((service) => (
            <Text
              key={service}
              className="text-sm p-1 rounded-xl border border-primary-300"
            >
              {service}
            </Text>
          ))}
      </View>
    </View>
  );
};
