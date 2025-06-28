// getPolygonCenter.ts

// 이미 생성된 라벨 키 저장 (중복 방지용 Set)
const displayedZoneKeys = new Set<string>();

export function getPolygonCenter(
  path: any[],
  useZone?: string
): kakao.maps.LatLng | null {
  if (!path || path.length === 0) return new kakao.maps.LatLng(0, 0);

  let sumLat = 0;
  let sumLng = 0;

  path.forEach((point) => {
    const lat = typeof point.getLat === "function" ? point.getLat() : point.Ma;
    const lng = typeof point.getLng === "function" ? point.getLng() : point.La;
    sumLat += lat;
    sumLng += lng;
  });

  const centerLat = sumLat / path.length;
  const centerLng = sumLng / path.length;

  const roundedLat = centerLat.toFixed(4);
  const roundedLng = centerLng.toFixed(4);

  // 중복 방지를 위한 고유 키
  const key = `${useZone}_${roundedLat}_${roundedLng}`;

  if (displayedZoneKeys.has(key)) {
    return null; // 이미 표시한 위치이므로 null 반환
  } else {
    displayedZoneKeys.add(key);
    return new kakao.maps.LatLng(centerLat, centerLng);
  }
}
