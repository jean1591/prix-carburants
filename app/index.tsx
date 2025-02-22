import * as Location from "expo-location";

import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Fields,
  OpeningHours as OpeningHoursType,
  PosResponse,
} from "@/libs/pos.type";
import { useEffect, useState } from "react";

import NoResults from "@/components/NoResults";
import { SafeAreaView } from "react-native-safe-area-context";
import { ValidParams } from "@/libs/getPos.type";
import { getPos } from "@/libs/getPos";
import icons from "@/constants/icons";
import { useDebouncedCallback } from "use-debounce";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [city, setCity] = useState<string>();
  /* const [location, setLocation] = useState<
    { latitude: number; longitude: number } | undefined
  >({ latitude: 43.4844836, longitude: -1.5473273 }); */
  const [location, setLocation] = useState<
    { latitude: number; longitude: number } | undefined
  >();
  const [pointsOfSale, setPointsOfSale] = useState<PosResponse | undefined>();

  const handleOnSearch = (text: string) => {
    setCity(text);
  };

  useEffect(() => {
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
    };

    getPermission();
  }, []);

  useEffect(() => {
    const getData = async (params: ValidParams) => {
      let pos: PosResponse | undefined = undefined;

      if (params.city) {
        const { city } = params;

        pos = await getPos({ city });
      }

      if (params.coordinates) {
        const {
          coordinates: { latitude, longitude },
        } = params;

        pos = await getPos({ coordinates: { latitude, longitude } });
      }

      setPointsOfSale(pos);
    };

    if (city) {
      setLoading(true);
      getData({ city });
    }

    if (location && location.latitude && location.longitude) {
      setLoading(true);
      getData({
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
    }

    setLoading(false);
  }, [location, city]);

  return (
    <SafeAreaView className="bg-white h-full px-5">
      {pointsOfSale && (
        <FlatList
          data={pointsOfSale.records}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                className="text-primary-300 mt-5"
              />
            ) : (
              <NoResults />
            )
          }
          renderItem={({ item }) => <PointOfSale fields={item.fields} />}
          keyExtractor={(item) => item.fields.id.toString()}
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex gap-5 mt-5"
          ListHeaderComponent={
            <View className="flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-8 py-2">
              <View className="flex-1 flex flex-row items-center justify-start z-50">
                <Image source={icons.search} className="size-5" />
                <TextInput
                  value={city}
                  onChangeText={handleOnSearch}
                  placeholder="Rechercher une ville"
                  className="text-sm font-rubik text-black-300 ml-2 flex-1"
                />
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const PointOfSale = ({ fields }: { fields: Fields }) => {
  const prices = JSON.parse(fields.prix);

  return (
    <View className="bg-primary-100 rounded-xl p-4 mt-8">
      <Text className="uppercase text-2xl font-rubik-bold tracking-tight leading-tight">
        {fields.name}
      </Text>
      <Text className="uppercase text-2xl font-rubik-bold tracking-tight leading-tight">
        {fields.adresse}
      </Text>

      <View className="flex items-baseline justify-start gap-4 flex-row flex-wrap">
        <Text className="mt-1 text-lg font-rubik-bold tracking-tight leading-tight">
          {fields.ville} {fields.cp}
        </Text>
        {fields.dist && (
          <Text className="mt-1 text-lg tracking-tight leading-tight">
            {formatDistance(fields.dist)}
          </Text>
        )}
      </View>

      {prices && Array.isArray(prices) && (
        <View className="w-full items-center justify-start mt-8 flex flex-row gap-2 flex-wrap">
          {prices.map((price) => (
            <View
              key={price["@id"]}
              className="basis-1/3 flex-1 bg-primary-200 rounded-xl p-4"
            >
              <Text className="text-xl font-rubik-bold">
                {price["@valeur"]}€
              </Text>
              <Text className="text-sm">{price["@nom"]}</Text>
              <PriceUpdate updatedAt={price["@maj"]} />
            </View>
          ))}
        </View>
      )}

      <OpeningHours openingHours={fields.horaires} />

      <Services services={fields.services_service} />
    </View>
  );
};

const PriceUpdate = ({ updatedAt }: { updatedAt: string }) => {
  const updatedAtString = timeAgo(updatedAt);
  const isUpdatedSeveralDaysAgo = updatedAtString.split(" ").at(-1) === "jours";
  const isUpdatedMoreThan5DaysAgo =
    parseInt(updatedAtString.split(" ").at(-2)!) >= 5;

  let className = "";

  if (isUpdatedSeveralDaysAgo && isUpdatedMoreThan5DaysAgo) {
    className = "text-red-800";
  }

  return <Text className={`text-xs ${className}`}>{updatedAtString}</Text>;
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

const OpeningHours = ({
  openingHours,
}: {
  openingHours: string | undefined;
}) => {
  if (!openingHours) {
    return;
  }

  const times = JSON.parse(openingHours) as OpeningHoursType;

  if (!times.jour) {
    return;
  }

  return (
    <View className="mt-8">
      {times.jour.map((jour) => (
        <View key={jour["@id"]} className="mb-2 flex flex-row justify-between">
          <Text>{jour["@nom"]}</Text>

          {jour.horaire && Array.isArray(jour.horaire) && (
            <View className="flex flex-col justify-end">
              {jour.horaire.map((hours) => (
                <DisplayedOpeningHours
                  key={hours["@ouverture"]}
                  openingHours={hours}
                />
              ))}
            </View>
          )}

          {jour.horaire &&
            typeof jour.horaire === "object" &&
            !Array.isArray(jour.horaire) && (
              <View className="flex flex-col gap-2 justify-end">
                <DisplayedOpeningHours
                  key={jour.horaire["@ouverture"]}
                  openingHours={jour.horaire}
                />
              </View>
            )}
        </View>
      ))}
    </View>
  );
};

const DisplayedOpeningHours = ({
  openingHours,
}: {
  openingHours: { "@ouverture": string; "@fermeture": string };
}) => {
  const open = openingHours["@ouverture"].replace(".", ":");
  const close = openingHours["@fermeture"].replace(".", ":");

  return (
    <Text>
      {open} - {close}
    </Text>
  );
};
