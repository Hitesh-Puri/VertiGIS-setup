import type { LibraryRegistry } from "@vertigis/web/config";

import MapClickAlertModel from "./MapClickAlertModel";

export function registerProject10Components(registry: LibraryRegistry, namespace: string): void {
  registry.registerService({
    id: "map-click-service",
    getService: () => new MapClickAlertModel(),
  });

  registry.registerOperation({
    name: "map.click.find-nearby-features",
    serviceId: "map-click-service",
  });

  registry.registerOperation({
    name: "map.click.show-feature-popup",
    serviceId: "map-click-service",
  });

  registry.registerOperation({
    name: "map.click.handle-click",
    serviceId: "map-click-service",
  });
}
