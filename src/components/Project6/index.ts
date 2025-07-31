import type { LibraryRegistry } from "@vertigis/web/config";

import BasemapOpacitySlider from "./BasemapOpacitySlider";
import BasemapOpacitySliderModel from "./BasemapOpacitySliderModel";

export { default as BasemapOpacitySlider } from "./BasemapOpacitySlider";
export { default as BasemapOpacitySliderModel } from "./BasemapOpacitySliderModel";
export type { BasemapOpacitySliderModelProperties } from "./BasemapOpacitySliderModel";

export function registerProject6Components(registry: LibraryRegistry, namespace: string): void {
  registry.registerComponent({
    name: "basemap-opacity-slider",
    namespace,
    getComponentType: () => BasemapOpacitySlider,
    itemType: "basemap-opacity-slider-model",
    title: "Basemap Opacity Slider",
    category: "map",
    iconId: "layers",
  });

  registry.registerModel({
    getModel: config => new BasemapOpacitySliderModel(config),
    itemType: "basemap-opacity-slider-model",
  });
}
