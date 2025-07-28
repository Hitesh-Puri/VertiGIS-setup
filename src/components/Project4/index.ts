import type { LibraryRegistry } from "@vertigis/web/config";
import GeometricLocation from "./GeometricLocation";
import GeometricLocationModel from "./GeometricLocationModel";
// Project4 - Geometric Location Context Menu

export { default } from "./GeometricLocation";
export { GeometricLocationModel };
export type { GeometricLocationModelProperties } from "./GeometricLocationModel";

export function registerProject4Components(registry: LibraryRegistry, namespace: string): void {
  registry.registerComponent({
    category: "map",
    iconId: "coordinate-systems",
    name: "geometric-location",
    namespace,
    getComponentType: () => GeometricLocation,
    itemType: "geometric-location-model",
    title: "Geometric Location",
  });
  registry.registerModel({
    getModel: config => new GeometricLocationModel(config),
    itemType: "geometric-location-model",
  });
  registry.registerCommand({
    name: "geometric-location.show",
    itemType: "geometric-location-model",
  });
}
