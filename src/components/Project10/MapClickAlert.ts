import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as projection from "@arcgis/core/geometry/projection";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { operation } from "@vertigis/web/messaging";
import { ServiceBase } from "@vertigis/web/services";

interface NearbyFeature {
  layerTitle: string;
  attributes: Record<string, unknown>;
  geometry: __esri.Geometry;
}

export default class MapClickAlert extends ServiceBase {
  @operation("map.click.find-nearby-features")
  public async findNearbyFeatures(x: any, y: any, mapExtension: any) {
    try {
      console.log("findNearbyFeatures called with:", { x, y, mapExtension });

      if (!mapExtension?.map) {
        console.error("Map extension not available");
        await this.showNotification("Map extension not available");
        return [];
      }

      // Use the map's spatial reference instead of hardcoding
      // const mapSpatialReference = mapExtension.map.spatialReference;
      const mapSpatialReference = new SpatialReference({ wkid: 102100 });
      console.log("Map spatial reference:", mapSpatialReference);

      const clickPoint = new Point({
        x,
        y,
        spatialReference: mapSpatialReference,
      });

      // for buffering, we need to ensure the geometryEngine is loaded
      const buffer: any = geometryEngine.buffer(clickPoint, 100, "meters");
      console.log("Buffer created:", buffer);

      // construct a polygon from the buffer and set its spatial reference
      const searchArea = new Polygon({
        rings: buffer["rings"],
        spatialReference: mapSpatialReference,
      });

      // feature layers
      const layers: FeatureLayer[] = [];
      mapExtension.map.layers.forEach((layer: any) => {
        if (layer.type === "feature") {
          layers.push(layer as FeatureLayer);
        }
      });

      console.log("Found feature layers:", layers.length);

      if (layers.length === 0) {
        await this.showNotification("No queryable feature layers found");
        return [];
      }

      const results: NearbyFeature[] = [];

      // Query each layer for features in the buffer
      for (const layer of layers) {
        try {
          console.log(`Querying layer: ${layer.title}`);
          let queryGeometry = searchArea;

          // Handle spatial reference differences if needed
          if (searchArea.spatialReference.wkid !== layer.spatialReference.wkid) {
            console.log(
              `Projecting from ${searchArea.spatialReference.wkid} to ${layer.spatialReference.wkid}`
            );
            // eslint-disable-next-line no-await-in-loop
            await projection.load();
            queryGeometry = projection.project(
              searchArea,
              layer.spatialReference
            ) as __esri.Polygon;
          }

          const query = layer.createQuery();
          query.geometry = queryGeometry;
          query.spatialRelationship = "intersects";
          query.outFields = ["*"];
          query.returnGeometry = true;

          // eslint-disable-next-line no-await-in-loop
          const queryResult = await layer.queryFeatures(query);
          console.log(`Query result for ${layer.title}:`, queryResult.features.length, "features");

          queryResult.features.forEach(feature => {
            results.push({
              layerTitle: layer.title,
              attributes: feature.attributes,
              geometry: feature.geometry,
            });
          });
        } catch (error) {
          console.error(`Error querying layer ${layer.title}:`, error);
        }
      }

      console.log("Total results found:", results.length);

      // for notifying the user
      if (results.length > 0) {
        await this.showFeaturePopup(results);
      } else {
        await this.showNotification("No features found within 100 meters of the clicked location");
      }

      return results;
    } catch (error) {
      console.error("Error in findNearbyFeatures:", error);
      await this.showNotification("Error finding nearby features");
      throw error;
    }
  }

  private async showFeaturePopup(features: NearbyFeature[]): Promise<void> {
    try {
      const featuresToShow = features.slice(0, 10);
      let message = "";

      featuresToShow.forEach((feature, index) => {
        message += `\n${index + 1}. Layer: ${feature.layerTitle}\n`;
        message += `${Object.entries(feature.attributes)
          .filter(([key]) => key !== "OBJECTID")
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")}\n`;
      });

      if (features.length > 10) {
        message += `\n...and ${features.length - 10} more features`;
      }

      await this.messages.commands.ui.displayNotification.execute({
        title: "Nearby Features",
        message: message.trim(),
      });
    } catch (error) {
      console.error("Error showing feature popup:", error);
      await this.showNotification("Error displaying feature information");
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async showNotification(message: string): Promise<void> {
    await this.messages.commands.ui.displayNotification.execute({
      title: "My Click",
      message,
    });
  }
}
