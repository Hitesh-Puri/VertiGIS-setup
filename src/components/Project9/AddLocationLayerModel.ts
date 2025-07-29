/* eslint-disable no-await-in-loop */
import type { MapExtension } from "@vertigis/arcgis-extensions/mapping/MapExtension";
import {
  ComponentModelBase,
  serializable,
  type ComponentModelProperties,
  importModel,
} from "@vertigis/web/models";
import Graphic from "esri/Graphic";
import Point from "esri/geometry/Point";
import FeatureLayer from "esri/layers/FeatureLayer";

export type AddLocationLayerModelProperties = ComponentModelProperties;

@serializable
export default class AddLocationLayerModel extends ComponentModelBase<AddLocationLayerModelProperties> {
  @importModel("map-extension")
  mapExtension: MapExtension;

  async addLocationLayers(): Promise<void> {
    try {
      const response = await fetch(
        "https://desktop-85sdjag/server/rest/services/Hosted/DevMAINLOCATIONS/FeatureServer?f=json"
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch layer list: ${response.statusText}`);
      }

      const data = await response.json();
      const layers = data.layers || [];
      console.log("Location layers:", layers);

      for (const layer of layers) {
        const layerId = `dev-main-layer-${layer.id}`;
        const existing = this.mapExtension?.map.findLayerById(layerId);
        if (existing) {
          continue;
        }

        const featureLayer = new FeatureLayer({
          url: `https://desktop-85sdjag/server/rest/services/Hosted/DevMAINLOCATIONS/FeatureServer/${layer.id}`,
          id: layerId,
          title: layer.name || `Location Layer ${layer.id}`,
          visible: true,
          outFields: ["*"],
        });

        await this.messages.commands.map.addLayers.execute({
          layers: featureLayer,
          maps: this.mapExtension,
        });

        await this.addSampleFeature(featureLayer);
      }

      await this.messages.commands.ui.alert.execute({
        message: "All location layers added successfully!",
      });
    } catch (error) {
      console.error("Error adding Location layers:", error);
      await this.messages.commands.ui.alert.execute({
        message: `Error adding location layers: ${error}`,
      });
    }
  }

  private async addSampleFeature(featureLayer: FeatureLayer): Promise<void> {
    try {
      const point = new Point({
        x: 0,
        y: 0,
        spatialReference: { wkid: 3857 },
      });

      const newFeature = new Graphic({
        geometry: point,
        attributes: {
          Name: "Sample Location",
          Description: "Added from location layer component",
          Type: "Location Point",
        },
      });

      const result = await featureLayer.applyEdits({
        addFeatures: [newFeature],
      });

      if (result.addFeatureResults?.[0].objectId) {
        console.log(`Sample feature added with Object ID: ${result.addFeatureResults[0].objectId}`);
      } else {
        console.warn("Sample feature add did not return ObjectID.");
      }
    } catch (editError) {
      console.error("Failed to add sample feature to layer:", editError);
    }
  }
}
