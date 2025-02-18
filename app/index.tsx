import * as Location from "expo-location";

import { Fields, Response } from "@/libs/pos.type";
import { FlatList, ScrollView, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import mock from "./mock.json";

const getUrl = (latitude: number, longitude: number) =>
  `https://data.economie.gouv.fr/api/records/1.0/search/?dataset=prix-des-carburants-en-france-flux-instantane-v2&geofilter.distance=${latitude},${longitude},5000`;

const formatDistance = (distance: string): string => {
  const match = distance.match(/^\d+\.?\d*/);

  if (!match) {
    throw new Error("Invalid distance input");
  }

  let value = parseFloat(match[0]);

  if (value >= 1000) {
    value /= 1000;
    return `${value.toFixed(1)}km`;
  }

  return `${Math.round(value)}m`;
};

const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays > 1) return `Il y a ${diffDays} jours`;
  if (diffDays === 1) return "Hier";
  if (diffHours > 1) return `Il y a ${diffHours} heures`;
  if (diffHours === 1) return "Il y a 1 heure";

  return "À l'instant";
};

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
      {pointsOfSale && (
        <FlatList
          data={pointsOfSale.records}
          renderItem={({ item }) => <PointOfSale fields={item.fields} />}
          keyExtractor={(item) => item.recordid}
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex gap-5 mt-8"
        />
      )}
    </SafeAreaView>
  );
}

const PointOfSale = ({ fields }: { fields: Fields }) => {
  return (
    <View className="bg-primary-100 rounded-xl p-4">
      <Text className="uppercase text-2xl font-rubik-bold tracking-tight leading-tight">
        {fields.adresse}
      </Text>

      <View className="flex items-baseline justify-start gap-4 flex-row flex-wrap">
        <Text className="mt-1 text-lg font-rubik-bold tracking-tight leading-tight">
          {fields.ville} {fields.cp}
        </Text>
        <Text className="mt-1 text-lg tracking-tight leading-tight">
          {formatDistance(fields.dist)}
        </Text>
      </View>

      <View className="w-full items-center justify-start mt-8 flex flex-row gap-2 flex-wrap">
        {JSON.parse(fields.prix).map((prix) => (
          <View
            key={prix["@id"]}
            className="basis-1/3 flex-1 bg-primary-200 rounded-xl p-4"
          >
            <Text className="text-xl font-rubik-bold">{prix["@valeur"]}€</Text>
            <Text className="text-sm">{prix["@nom"]}</Text>
            <Text className="text-xs">{timeAgo(prix["@maj"])}</Text>
          </View>
        ))}
      </View>

      <Services services={fields.services_service} />
    </View>
  );
};

const Services = ({ services }: { services: string | undefined }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-8"
    >
      {services &&
        services.split("//").map((service, index) => (
          <View
            key={index}
            className="flex flex-col items-start mr-4 px-4 py-2 rounded-full bg-primary-100 border border-primary-200"
          >
            <Text className="text-sm text-black-300">{service}</Text>
          </View>
        ))}
    </ScrollView>
  );
};
