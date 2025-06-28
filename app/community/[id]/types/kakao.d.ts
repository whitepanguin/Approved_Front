// types/kakao.d.ts
declare namespace kakao {
  namespace maps {
    class LatLng {
      constructor(lat: number, lng: number);
    }

    class Map {
      constructor(container: HTMLElement, options: object);
      setCenter(position: LatLng): void;
      setLevel(level: number): void;
    }

    class Marker {
      constructor(options: object);
      setMap(map: Map | null): void;
    }

    class Circle {
      constructor(options: object);
      setMap(map: Map | null): void;
    }

    class InfoWindow {
      constructor(options: object);
      open(map: Map, marker: Marker): void;
      close(): void;
    }

    class Services {
      static Geocoder: any;
    }
  }
}
