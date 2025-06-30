// types/kakao.d.ts

declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class Polygon {
    constructor(options: any);
    getPath(): any;
    setMap(map: Map | null): void;
  }

  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
    getCenter(): LatLng;
  }

  class Map {
    constructor(container: HTMLElement, options: any);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getLevel(): number;
  }

  class CustomOverlay {
    constructor(options: any);
    setMap(map: Map | null): void;
  }
}
