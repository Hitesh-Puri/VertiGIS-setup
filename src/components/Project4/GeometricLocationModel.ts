import type { MapModel } from "@vertigis/web/mapping";
import { command } from "@vertigis/web/messaging";
import {
  ComponentModelBase,
  serializable,
  type ComponentModelProperties,
  importModel,
} from "@vertigis/web/models";

export type GeometricLocationModelProperties = ComponentModelProperties;

@serializable
export default class GeometricLocationModel extends ComponentModelBase<GeometricLocationModelProperties> {
  @importModel("map-extension")
  map: MapModel;

  constructor(config: GeometricLocationModelProperties) {
    super(config);
    console.log("🚀 GeometricLocationModel initialized!");
  }

  /**
   * Show geometric location information in a toast
   * This command is triggered by map click events
   */
  @command("geometric-location.show")
  async showGeometricLocation(event?: any): Promise<void> {
    console.log("🎯 geometric-location.show command triggered!", event);

    try {
      // Map click events provide geometry in different ways
      let geometry = null;

      if (event?.mapPoint) {
        console.log("📍 Found mapPoint:", event.mapPoint);
        geometry = event.mapPoint;
      } else if (event?.geometry) {
        console.log("📍 Found geometry:", event.geometry);
        geometry = event.geometry;
      } else if (event?.args?.geometry) {
        console.log("📍 Found nested geometry:", event.args.geometry);
        geometry = event.args.geometry;
      } else {
        console.log("📍 No geometry found, using map center");
      }

      const locationInfo = geometry ? this.formatGeometryInfo(geometry) : this.getMapCenterInfo();

      console.log("📄 Location info to display:", locationInfo);
      this.showToast(locationInfo, "info");
      console.log("✅ Toast shown successfully");
    } catch (error) {
      console.error("❌ Error showing geometric location:", error);
      this.showToast(
        `Error retrieving location: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
    }
  }

  private formatGeometryInfo(geometry: any): string {
    const type = geometry.type?.toLowerCase();

    // Handle map click point (which might not have a type property)
    if (type === "point" || (geometry.x !== undefined && geometry.y !== undefined)) {
      return this.formatPointInfo(geometry);
    }
    if (type === "polyline") return this.formatPolylineInfo(geometry);
    if (type === "polygon") return this.formatPolygonInfo(geometry);

    // Fallback for unknown geometry types
    if (geometry.x !== undefined && geometry.y !== undefined) {
      return this.formatPointInfo(geometry);
    }

    return `Geometry Type: ${geometry.type || "Unknown"}\nCoordinates available in geometry object`;
  }

  private formatPointInfo(geometry: any): string {
    const x = (typeof geometry.x === "number" ? geometry.x.toFixed(6) : geometry.x) || "N/A";
    const y = (typeof geometry.y === "number" ? geometry.y.toFixed(6) : geometry.y) || "N/A";
    const spatialRef =
      geometry.spatialReference?.wkid || geometry.spatialReference?.latestWkid || "Unknown";
    return `Click Location:\nX: ${x}\nY: ${y}\nSpatial Reference: ${spatialRef}`;
  }

  private formatPolylineInfo(geometry: any): string {
    if (!geometry.paths?.length) return "Polyline: No path data available";

    const firstPath = geometry.paths[0];
    if (!firstPath.length) return "Polyline: Empty path";

    const startX = firstPath[0][0]?.toFixed(6);
    const startY = firstPath[0][1]?.toFixed(6);
    const endX = firstPath[firstPath.length - 1][0]?.toFixed(6);
    const endY = firstPath[firstPath.length - 1][1]?.toFixed(6);
    return `Polyline Location:\nStart: [${startX}, ${startY}]\nEnd: [${endX}, ${endY}]\nVertices: ${firstPath.length}`;
  }

  private formatPolygonInfo(geometry: any): string {
    if (!geometry.rings?.length) return "Polygon: No ring data available";

    const ring = geometry.rings[0];
    if (!ring.length) return "Polygon: Empty ring";

    const centerX =
      ring.reduce((sum: number, vertex: number[]) => sum + vertex[0], 0) / ring.length;
    const centerY =
      ring.reduce((sum: number, vertex: number[]) => sum + vertex[1], 0) / ring.length;
    return `Polygon Location:\nApprox Center: [${centerX.toFixed(6)}, ${centerY.toFixed(6)}]\nVertices: ${ring.length}`;
  }

  private getMapCenterInfo(): string {
    if (!this.map?.view) return "Location information not available";

    const center = this.map.view.center;
    if (!center) return "Map center not available";

    const x = center.x?.toFixed(6) || "N/A";
    const y = center.y?.toFixed(6) || "N/A";
    const spatialRef = center.spatialReference?.wkid || "Unknown";
    return `Map Center Location:\nX: ${x}\nY: ${y}\nSpatial Reference: ${spatialRef}`;
  }

  /**
   * Show a toast notification with geometric information
   */
  private showToast(message: string, type: "success" | "error" | "info" = "info"): void {
    const toast = document.createElement("div");
    toast.innerHTML = message.replace(/\n/g, "<br>");

    const bgColor = type === "error" ? "#dc3545" : type === "info" ? "#17a2b8" : "#28a745";

    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 16px 24px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.4;
      cursor: pointer;
      transition: opacity 0.3s ease;
      max-width: 350px;
      word-wrap: break-word;
    `;

    document.body.appendChild(toast);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);

    // Click to dismiss
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
