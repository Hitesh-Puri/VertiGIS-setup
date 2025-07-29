import type { LibraryRegistry } from "@vertigis/web/config";

import AddLocationLayer from "./AddLocationLayer";
import AddLocationLayerModel from "./AddLocationLayerModel";
// import FeatureCreator from "./FeatureCreator";
// import FeatureCreatorModel from "./FeatureCreatorModel";

export { default as FeatureCreator } from "./FeatureCreator";
export { default as FeatureCreatorModel } from "./FeatureCreatorModel";
export type { FeatureCreatorModelProperties } from "./FeatureCreatorModel";
export { default as AddLocationLayer } from "./AddLocationLayer";
export { default as AddLocationLayerModel } from "./AddLocationLayerModel";
export type { AddLocationLayerModelProperties } from "./AddLocationLayerModel";

export function registerProject9Components(registry: LibraryRegistry, namespace: string): void {
  // registry.registerComponent({
  //   name: "feature-creator",
  //   namespace,
  //   getComponentType: () => FeatureCreator,
  //   itemType: "feature-creator-model",
  //   title: "Feature Creator",
  //   category: "map",
  //   iconId: "add-location",
  // });

  // registry.registerModel({
  //   getModel: config => new FeatureCreatorModel(config),
  //   itemType: "feature-creator-model",
  // });

  registry.registerComponent({
    name: "add-location-layer",
    namespace,
    getComponentType: () => AddLocationLayer,
    itemType: "add-location-layer-model",
    title: "Add Location Layer",
    category: "map",
    iconId: "layers",
  });

  registry.registerModel({
    getModel: config => new AddLocationLayerModel(config),
    itemType: "add-location-layer-model",
  });
}
