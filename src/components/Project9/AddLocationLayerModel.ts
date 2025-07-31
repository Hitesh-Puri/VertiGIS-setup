/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable no-await-in-loop */
import type { MapModel } from "@vertigis/web/mapping";
import { command } from "@vertigis/web/messaging";
import {
  ComponentModelBase,
  serializable,
  type ComponentModelProperties,
  importModel,
} from "@vertigis/web/models";
import { inject } from "@vertigis/web/services";
// import Graphic from "esri/Graphic";
// import Point from "esri/geometry/Point";
import FeatureLayer from "esri/layers/FeatureLayer";

import MapClickAlertModel from "../Project10/MapClickAlertModel";

export type AddLocationLayerModelProperties = ComponentModelProperties;

@serializable
export default class AddLocationLayerModel extends ComponentModelBase<AddLocationLayerModelProperties> {
  @importModel("map-extension")
  map: MapModel;

  x?: number;
  y?: number;

  @inject("map-click-service")
  mapClickService: MapClickAlertModel;

  @command("points-of-interest.create")
  async createNew(event?: any): Promise<void> {
    try {
      let geometry = null;

      if (event?.mapPoint) {
        geometry = event.mapPoint;
      } else if (event?.geometry) {
        geometry = event.geometry;
      } else if (event?.args?.geometry) {
        geometry = event.args.geometry;
      }

      // Extract coordinates from geometry or use map center
      if (geometry && geometry.x !== undefined && geometry.y !== undefined) {
        this.x = geometry.x;
        this.y = geometry.y;
      } else {
        // Fallback to map center
        if (!this.map?.view) {
          console.error("Map not available");
          await this.messages.commands.ui.alert.execute({
            message: "Map not available",
          });
          return;
        }

        // Use map center as fallback
        const center = this.map.view.center;
        if (center) {
          this.x = center.x;
          this.y = center.y;
        } else {
          // Final fallback
          this.x = 0;
          this.y = 0;
        }
      }

      /* for project 10*/
      if (this.mapClickService) {
        // Pass the map in the expected format for MapClickAlertModel
        const mapExtension = { map: this.map.view?.map };
        await this.mapClickService.findNearbyFeatures(this.x, this.y, mapExtension);
      } else {
        console.error("Map click service not available");
        await this.messages.commands.ui.alert.execute({
          message: "Map click service not available",
        });
      }
    } catch (error) {
      console.error("Error in createNew:", error);
      await this.messages.commands.ui.alert.execute({
        message: `Error processing map click: ${error}`,
      });
    }
  }

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
        // Check if layer already exists by iterating through layers
        const existing = this.map?.view?.map?.layers?.find((layer: any) => layer.id === layerId);
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
          maps: this.map,
        });

        // await this.addSampleFeature(featureLayer);
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

  // private async addSampleFeature(featureLayer: FeatureLayer): Promise<void> {
  //   try {
  //     const point = new Point({
  //       x: 0,
  //       y: 0,
  //       spatialReference: { wkid: 3857 },
  //     });

  //     const newFeature = new Graphic({
  //       geometry: point,
  //       attributes: {
  //         Name: "Sample Location",
  //         Description: "Added from location layer component",
  //         Type: "Location Point",
  //       },
  //     });

  //     const result = await featureLayer.applyEdits({
  //       addFeatures: [newFeature],
  //     });

  //     if (result.addFeatureResults?.[0].objectId) {
  //       console.log(`Sample feature added with Object ID: ${result.addFeatureResults[0].objectId}`);
  //     } else {
  //       console.warn("Sample feature add did not return ObjectID.");
  //     }
  //   } catch (editError) {
  //     console.error("Failed to add sample feature to layer:", editError);
  //   }
  // }
}
