import Map from "../utils/map";

export async function reportMapper(report) {
  // Ambil koordinat dari lat dan lon langsung
  const latitude = report.lat;
  const longitude = report.lon;

  // Dapatkan placeName secara async
  const placeName = await Map.getPlaceNameByCoordinate([latitude, longitude]);

  return {
    ...report,
    location: {
      latitude,
      longitude,
      placeName,
    },
  };
}
