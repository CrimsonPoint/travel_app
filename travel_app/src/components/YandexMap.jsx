import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { loadYandexMaps } from "../utils/loadYandexMaps";

export default function YandexMap({ start, end }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!start || !end || !start.length || !end.length) {
      return;
    }

    loadYandexMaps()
      .then((ymaps) => {
        if (!mapRef.current) return;

        mapInstanceRef.current = new ymaps.Map(mapRef.current, {
          center: [...start],
          zoom: 12,
        });

        const multiRoute = new ymaps.multiRouter.MultiRoute(
          {
            referencePoints: [start, end],
            params: {
              routingMode: "pedestrian",
            },
          },
          {
            boundsAutoFit: true,
          }
        );

        multiRoute.model.events.add("requestsuccess", () => {
          mapInstanceRef.current.geoObjects.add(multiRoute);
        });

        multiRoute.model.events.add("requestfail", () => {
          toast.error("Не удалось построить пешеходный маршрут");
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
      });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [start, end]);

  return (
    <div className="w-full h-96">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-md"></div>
    </div>
  );
}
