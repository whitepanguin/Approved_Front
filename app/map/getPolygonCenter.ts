const displayedZoneKeys = new Set<string>();

export function getPolygonCenter(
  path: any[],
  useZone?: string
): {
  getLat(): number;
  getLng(): number;
} | null {
  if (!path || path.length === 0) return null;

  // 폴리곤의 무게중심(centroid) 계산
  let area = 0;
  let centroidLat = 0;
  let centroidLng = 0;

  for (let i = 0; i < path.length; i++) {
    const j = (i + 1) % path.length;

    const lat1 =
      typeof path[i].getLat === "function" ? path[i].getLat() : path[i].Ma;
    const lng1 =
      typeof path[i].getLng === "function" ? path[i].getLng() : path[i].La;
    const lat2 =
      typeof path[j].getLat === "function" ? path[j].getLat() : path[j].Ma;
    const lng2 =
      typeof path[j].getLng === "function" ? path[j].getLng() : path[j].La;

    const a = lat1 * lng2 - lat2 * lng1;
    area += a;
    centroidLat += (lat1 + lat2) * a;
    centroidLng += (lng1 + lng2) * a;
  }

  area *= 0.5;
  if (Math.abs(area) < 1e-10) {
    // 면적이 너무 작으면 기존 방식 사용
    let sumLat = 0;
    let sumLng = 0;
    path.forEach((point: any) => {
      const lat =
        typeof point.getLat === "function" ? point.getLat() : point.Ma;
      const lng =
        typeof point.getLng === "function" ? point.getLng() : point.La;
      sumLat += lat;
      sumLng += lng;
    });
    centroidLat = sumLat / path.length;
    centroidLng = sumLng / path.length;
  } else {
    centroidLat = centroidLat / (6 * area);
    centroidLng = centroidLng / (6 * area);
  }

  const roundedLat = centroidLat.toFixed(4);
  const roundedLng = centroidLng.toFixed(4);
  const key = `${useZone}_${roundedLat}_${roundedLng}`;

  if (displayedZoneKeys.has(key)) return null;
  displayedZoneKeys.add(key);

  // 타입 단언으로 반환
  return new kakao.maps.LatLng(centroidLat, centroidLng) as {
    getLat(): number;
    getLng(): number;
  };
}
