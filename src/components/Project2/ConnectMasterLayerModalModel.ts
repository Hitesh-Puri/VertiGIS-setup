import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import type { MapModel } from "@vertigis/web/mapping";
import { command } from "@vertigis/web/messaging";
import {
  ComponentModelBase,
  serializable,
  type ComponentModelProperties,
  importModel,
} from "@vertigis/web/models";

export type ConnectMasterLayerModalModelProperties = ComponentModelProperties;

// Renderer interfaces
export interface RendererSymbol {
  type: string;
  color?: number[] | string;
  size?: number;
  width?: number;
  style?: string;
  outline?: {
    color?: number[] | string;
    width?: number;
    style?: string;
  };
}

export interface LayerRenderer {
  type: string;
  symbol?: RendererSymbol;
  defaultSymbol?: RendererSymbol;
  field1?: string;
  uniqueValueInfos?: {
    value: any;
    symbol: RendererSymbol;
    label?: string;
  }[];
  classBreakInfos?: {
    classMaxValue: number;
    symbol: RendererSymbol;
    label?: string;
  }[];
}

// API Response interfaces
export interface APILayerItem {
  id: number;
  name: string;
  type: string;
  description?: string;
  geometryType?: string;
  minScale?: number;
  maxScale?: number;
  defaultVisibility?: boolean;
  parentLayerId?: number;
  subLayerIds?: number[];
  // Enhanced with renderer information
  drawingInfo?: {
    renderer?: LayerRenderer;
  };
  serviceUrl?: string;
  extent?: any;
}

export interface APILayerDetailsResponse {
  id: number;
  name: string;
  type: string;
  description?: string;
  geometryType?: string;
  minScale?: number;
  maxScale?: number;
  defaultVisibility?: boolean;
  parentLayerId?: number;
  subLayerIds?: number[];
  drawingInfo?: {
    renderer?: LayerRenderer;
  };
  fields?: {
    name: string;
    type: string;
    alias?: string;
  }[];
  capabilities?: string;
  extent?: any;
}

export interface APIFeatureServerResponse {
  currentVersion?: number;
  serviceDescription?: string;
  hasVersionedData?: boolean;
  maxRecordCount?: number;
  standardMaxRecordCount?: number;
  layers?: APILayerItem[];
  tables?: APILayerItem[];
  spatialReference?: any;
  initialExtent?: any;
  fullExtent?: any;
  timeInfo?: any;
  supportsDisconnectedEditing?: boolean;
  capabilities?: string;
  description?: string;
  copyrightText?: string;
  advancedQueryCapabilities?: any;
}

// Utility function to map geometry types
export const mapEsriGeometryType = (geometryType?: string): string => {
  if (!geometryType) return "point";

  const typeMap: Record<string, string> = {
    esriGeometryPoint: "point",
    esriGeometryPolyline: "polyline",
    esriGeometryPolygon: "polygon",
    esriGeometryMultipoint: "multipoint",
  };

  return typeMap[geometryType] || geometryType.toLowerCase();
};

// Utility function to convert API layer to FeatureLayer
export const convertToFeatureLayer = (layer: APILayerItem, baseUrl: string): FeatureLayer => {
  const url = `${baseUrl}/${layer.id}`;

  return new FeatureLayer({
    url,
    id: `connectmaster-layer-${layer.id}`,
    title: layer.name || `Layer ${layer.id}`,
    visible: false, // default to hidden
    geometryType: mapEsriGeometryType(layer.geometryType) as any,
    outFields: ["*"],
  });
};

@serializable
export default class ConnectMasterLayerModalModel extends ComponentModelBase<ConnectMasterLayerModalModelProperties> {
  @importModel("map-extension")
  map: MapModel;

  // Store current geometry type and layer for reference
  public geo?: string;
  public layer?: FeatureLayer;

  private readonly apiEndpoint =
    "https://ckmvlf3.amantyatech.com:8091/rest/services/CONNECTMASTER_ProjectVersion-61/FeatureServer";

  // State management
  private _apiLayers: APILayerItem[] = [];
  private _loading = false;
  private _error: string | null = null;

  /**
   * Get API layers from the ConnectMaster endpoint
   */
  get apiLayers(): APILayerItem[] {
    return this._apiLayers;
  }

  /**
   * Get loading state
   */
  get isLoading(): boolean {
    return this._loading;
  }

  /**
   * Get error state
   */
  get error(): string | null {
    return this._error;
  }

  /**
   * Fetch layers from the API endpoint
   */
  async fetchApiLayers(): Promise<void> {
    this._loading = true;
    this._error = null;

    try {
      const response = await fetch(`${this.apiEndpoint}?f=json`);
      console.log("fetchAPILayers -> ", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIFeatureServerResponse = await response.json();

      this._apiLayers = (data.layers || []).map(layer => ({
        ...layer,
        serviceUrl: `${this.apiEndpoint}/${layer.id}`,
      }));

      this.showToast(`Successfully loaded ${this._apiLayers.length} layers from API`);
    } catch (error) {
      this._error = error instanceof Error ? error.message : "Unknown error occurred";
      this.showToast(`Error loading layers: ${this._error}`, "error");
    } finally {
      this._loading = false;
    }
  }

  /**
   * Fetch detailed layer information including renderer
   */
  async fetchLayerDetails(layerId: number): Promise<APILayerDetailsResponse | null> {
    try {
      const response = await fetch(`${this.apiEndpoint}/${layerId}?f=json`);
      console.log("fetchLayerDetails -> ", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APILayerDetailsResponse = await response.json();
      return data;
    } catch (error) {
      this.showToast(
        `Error fetching layer details: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
      return null;
    }
  }

  /**
   * Zoom to layer extent
   */
  async zoomToLayer(layer: APILayerItem): Promise<void> {
    try {
      const details = await this.fetchLayerDetails(layer.id);
      console.log("zoomToLayer -> ", details);

      if (details?.extent && this.map) {
        await this.messages.commands.map.zoomToViewpoint.execute({
          viewpoint: {
            targetGeometry: details.extent,
          },
        });
        this.showToast(`Zoomed to ${layer.name}`);
      } else {
        this.showToast(`No extent available for ${layer.name}`, "error");
      }
    } catch (error) {
      this.showToast(
        `Error zooming to layer: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
    }
  }

  /**
   * Add layers to map using improved pattern
   */
  async addLayerToMap(layers: APILayerItem[]): Promise<void> {
    if (!this.map) {
      console.error("Map is not initialized.");
      this.showToast("Map not available", "error");
      return;
    }

    // Map layers to FeatureLayer objects and set visibility to true
    const featureLayers = layers.map(layer => {
      const featureLayer = convertToFeatureLayer(layer, this.apiEndpoint);
      this.geo = featureLayer.geometryType;
      this.layer = featureLayer;
      featureLayer.visible = true;

      console.log(`Adding layer: ${layer.name}, Visible: ${featureLayer.visible}`);
      return featureLayer;
    });

    try {
      // For now, just show a toast with success message
      // TODO: Implement proper layer addition when VertiGIS operations are clarified
      console.log("Layers prepared for map:", featureLayers);
      this.showToast(`Prepared ${layers.length} layer(s) for map addition`);
    } catch (error) {
      console.error("Error preparing layers for map:", error);
      this.showToast(
        `Error preparing layers: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
    }
  }

  /**
   * Update layer renderer with new color and size
   */
  async updateLayerRenderer(layerId: number, color: string, size: number): Promise<void> {
    try {
      // Update the layer in our local state
      const layerIndex = this._apiLayers.findIndex(l => l.id === layerId);
      if (layerIndex !== -1) {
        const layer = this._apiLayers[layerIndex];

        // Create or update renderer
        const updatedRenderer: LayerRenderer = {
          type: "simple",
          symbol: {
            type: "simple-marker-symbol",
            color,
            size,
            outline: {
              color: "#ffffff",
              width: 1,
            },
          },
        };

        // Update local layer data
        this._apiLayers[layerIndex] = {
          ...layer,
          drawingInfo: {
            renderer: updatedRenderer,
          },
        };

        this.showToast(`Updated renderer for ${layer.name}`);
      }
    } catch (error) {
      this.showToast(
        `Error updating renderer: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
    }
  }

  /**
   * Command to open the layer modal
   */
  @command("connectmaster-layer-modal.open")
  async openModal(): Promise<void> {
    // Fetch API layers when modal opens
    await this.fetchApiLayers();
  }

  /**
   * Command to close the layer modal
   */
  @command("connectmaster-layer-modal.close")
  async closeModal(): Promise<void> {}

  /**
   * Show properties panel for a layer
   */
  async showLayerProperties(layer: APILayerItem): Promise<void> {
    // Fetch detailed layer information if not already available
    if (!layer.drawingInfo) {
      const details = await this.fetchLayerDetails(layer.id);
      if (details?.drawingInfo) {
        // Update the layer with renderer information
        const layerIndex = this._apiLayers.findIndex(l => l.id === layer.id);
        if (layerIndex !== -1) {
          this._apiLayers[layerIndex] = {
            ...this._apiLayers[layerIndex],
            drawingInfo: details.drawingInfo,
          };
        }
      }
    }
    this.showToast(`Showing properties for: ${layer.name}`);
  }

  /**
   * Hide properties panel
   */
  async hideLayerProperties(): Promise<void> {}

  /**
   * Add API layer to map as a FeatureLayer
   */
  async addApiLayerToMap(layer: APILayerItem): Promise<void> {
    await this.addLayerToMap([layer]);
  }

  /**
   * Get renderer color as CSS string
   */
  getRendererColor(renderer?: LayerRenderer): string {
    if (!renderer?.symbol?.color && !renderer?.defaultSymbol?.color) {
      return "#007ac3"; // Default blue
    }

    const color = renderer.symbol?.color || renderer.defaultSymbol?.color;

    if (Array.isArray(color)) {
      // RGBA array format [r, g, b, a]
      return `rgba(${color[0] || 0}, ${color[1] || 0}, ${color[2] || 0}, ${color[3] !== undefined ? color[3] / 255 : 1})`;
    }

    if (typeof color === "string") {
      return color;
    }

    return "#007ac3"; // Default blue
  }

  /**
   * Get renderer size
   */
  getRendererSize(renderer?: LayerRenderer): number {
    return (
      renderer?.symbol?.size ||
      renderer?.symbol?.width ||
      renderer?.defaultSymbol?.size ||
      renderer?.defaultSymbol?.width ||
      6
    );
  }

  /**
   * Show a toast notification
   */
  private showToast(message: string, type: "success" | "error" = "success"): void {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "error" ? "#dc3545" : "#009400"};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 20001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            cursor: pointer;
            transition: opacity 0.3s ease;
        `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);

    toast.addEventListener("click", () => {
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    });
  }
}
