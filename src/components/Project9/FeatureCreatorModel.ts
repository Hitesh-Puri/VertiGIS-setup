import Point from "esri/geometry/Point";
import Polygon from "esri/geometry/Polygon";
import Polyline from "esri/geometry/Polyline";
import Graphic from "esri/Graphic";
import FeatureLayer from "esri/layers/FeatureLayer";
import type { MapExtension } from "@vertigis/arcgis-extensions/mapping/MapExtension";
import {
  ComponentModelBase,
  serializable,
  type ComponentModelProperties,
  importModel,
} from "@vertigis/web/models";

export type FeatureCreatorModelProperties = ComponentModelProperties;

interface FeatureAttributes {
  name: string;
  description: string;
  type: string;
  createdBy: string;
  createdDate: string;
}

@serializable
export default class FeatureCreatorModel extends ComponentModelBase<FeatureCreatorModelProperties> {
  @importModel("map-extension")
  mapExtension: MapExtension;

  selectedGeometryType: "point" | "polyline" | "polygon" = "point";
  isDrawing: boolean = false;
  featureLayers: FeatureLayer[] = [];
  selectedLayer: FeatureLayer | null = null;
  featureAttributes: FeatureAttributes = {
    name: "",
    description: "",
    type: "",
    createdBy: "User",
    createdDate: new Date().toISOString(),
  };

  async initialize(): Promise<void> {
    await this.loadFeatureLayers();
  }

  setGeometryType(type: "point" | "polyline" | "polygon"): void {
    this.selectedGeometryType = type;
  }

  setFeatureAttributes(attributes: Partial<FeatureAttributes>): void {
    this.featureAttributes = { ...this.featureAttributes, ...attributes };
  }

  selectLayer(layer: FeatureLayer | null): void {
    this.selectedLayer = layer;
  }

  async startDrawing(): Promise<void> {
    this.isDrawing = true;
    console.log(`Drawing mode activated for ${this.selectedGeometryType}`);
  }

  async stopDrawing(): Promise<void> {
    this.isDrawing = false;
    console.log("Drawing mode deactivated");
  }

  async createHardcodedFeature(): Promise<void> {
    if (!this.selectedLayer) {
      await this.showNotification("Please select a feature layer first", "warning");
      return;
    }

    try {
      // Create hardcoded geometry based on selected type
      const geometry = this.createHardcodedGeometry();

      if (!geometry) {
        await this.showNotification("Failed to create geometry", "error");
        return;
      }

      // Create the feature graphic
      const feature = new Graphic({
        geometry: geometry,
        attributes: {
          Name: this.featureAttributes.name || "Hardcoded Feature",
          Description: this.featureAttributes.description || "Created programmatically",
          Type: this.featureAttributes.type || this.selectedGeometryType,
          CreatedBy: this.featureAttributes.createdBy,
          CreatedDate: this.featureAttributes.createdDate,
        },
      });

      // Add the feature to the selected layer
      const result = await this.selectedLayer.applyEdits({
        addFeatures: [feature],
      });

      if (result.addFeatureResults?.[0]?.objectId) {
        const objectId = result.addFeatureResults[0].objectId;
        await this.showNotification(
          `Feature added successfully with Object ID: ${objectId}`,
          "success"
        );

        // Feature created successfully

        console.log(`Feature added with Object ID: ${objectId}`);
      } else {
        await this.showNotification("Feature added but no Object ID returned", "warning");
      }
    } catch (error) {
      console.error("Failed to create hardcoded feature:", error);
      await this.showNotification("Failed to create feature", "error");
    }
  }

  async addFeatureFromDrawing(): Promise<void> {
    if (!this.selectedLayer) {
      await this.showNotification("Please select a feature layer first", "warning");
      return;
    }

    // For now, create a hardcoded feature since drawing integration needs more investigation
    await this.createHardcodedFeature();
  }

  async loadFeatureLayers(): Promise<void> {
    try {
      if (!this.mapExtension?.map) {
        console.warn("Map not available");
        return;
      }

      // Get all feature layers from the map
      const layers: FeatureLayer[] = [];
      this.mapExtension.map.layers.forEach((layer: any) => {
        if (layer instanceof FeatureLayer) {
          layers.push(layer);
        }
      });

      this.featureLayers = layers;

      if (layers.length > 0) {
        this.selectedLayer = layers[0]; // Select the first layer by default
      }

      console.log(`Found ${layers.length} feature layers`);
    } catch (error) {
      console.error("Failed to load feature layers:", error);
    }
  }

  private createHardcodedGeometry(): any {
    // Use hardcoded coordinates similar to reference implementation
    const x = 0;
    const y = 0;
    const spatialReference = { wkid: 3857 };

    switch (this.selectedGeometryType) {
      case "point":
        return new Point({
          x: x,
          y: y,
          spatialReference: spatialReference,
        });

      case "polyline":
        // Create a simple line
        const lineCoords = [
          [x - 100, y - 100],
          [x + 100, y + 100],
        ];
        return new Polyline({
          paths: [lineCoords],
          spatialReference: spatialReference,
        });

      case "polygon":
        // Create a simple rectangle
        const polygonCoords = [
          [
            [x - 100, y - 100],
            [x + 100, y - 100],
            [x + 100, y + 100],
            [x - 100, y + 100],
            [x - 100, y - 100], // Close the polygon
          ],
        ];
        return new Polygon({
          rings: polygonCoords,
          spatialReference: spatialReference,
        });

      default:
        return null;
    }
  }

  private async showNotification(
    message: string,
    type: "success" | "warning" | "error"
  ): Promise<void> {
    try {
      await this.messages.commands.ui.alert.execute({
        message: message,
      });
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  }
}
