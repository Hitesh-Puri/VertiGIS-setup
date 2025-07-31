import type { MapModel } from "@vertigis/web/mapping";
import {
  ComponentModelBase,
  serializable,
  type ComponentModelProperties,
  importModel,
} from "@vertigis/web/models";

export type BasemapOpacitySliderModelProperties = ComponentModelProperties;

@serializable
export default class BasemapOpacitySliderModel extends ComponentModelBase<BasemapOpacitySliderModelProperties> {
  @importModel("map-extension")
  map: MapModel;

  opacity: number = 1.0;

  async initialize(): Promise<void> {
    await this.updateOpacityFromMap();
  }

  async handleOpacityChange(value: number): Promise<void> {
    this.opacity = value;

    try {
      await this.updateBasemapOpacity(value);

      console.log(`Basemap opacity updated to: ${(value * 100).toFixed(0)}%`);
    } catch (error) {
      console.error("Failed to update basemap opacity:", error);
    }
  }

  getOpacityPercentage(): string {
    return `${(this.opacity * 100).toFixed(0)}%`;
  }

  private async updateBasemapOpacity(opacity: number): Promise<void> {
    const mapView = this.map?.view;
    if (!mapView) {
      console.warn("Map view not available");
      return;
    }

    const basemapLayers = mapView.map.basemap?.baseLayers;
    if (!basemapLayers || basemapLayers.length === 0) {
      console.warn("No basemap layers found");
      return;
    }

    basemapLayers.forEach((layer: any) => {
      if (layer && typeof layer.opacity !== "undefined") {
        layer.opacity = opacity;
      }
    });

    const referenceLayers = mapView.map.basemap?.referenceLayers;
    if (referenceLayers && referenceLayers.length > 0) {
      referenceLayers.forEach((layer: any) => {
        if (layer && typeof layer.opacity !== "undefined") {
          layer.opacity = opacity;
        }
      });
    }
  }

  private async updateOpacityFromMap(): Promise<void> {
    const mapView = this.map?.view;
    if (!mapView) {
      return;
    }

    const basemapLayers = mapView.map.basemap?.baseLayers;
    if (basemapLayers && basemapLayers.length > 0) {
      const firstLayer = basemapLayers.getItemAt(0);
      if (typeof firstLayer?.opacity !== "undefined") {
        this.opacity = firstLayer.opacity;
      }
    }
  }
}
