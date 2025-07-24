import type { MapModel } from "@vertigis/web/mapping";
import { command } from "@vertigis/web/messaging";
import {
    ComponentModelBase,
    serializable,
    type ComponentModelProperties,
    importModel,
} from "@vertigis/web/models";

export type ConnectMasterLayerModalModelProperties = ComponentModelProperties;

export interface LayerItem {
    id: string;
    title: string;
    type: string;
    visible: boolean;
    opacity: number;
    url?: string;
    description?: string;
}

export interface MyLayerItem {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
}

@serializable
export default class ConnectMasterLayerModalModel extends ComponentModelBase<ConnectMasterLayerModalModelProperties> {
    @importModel("map-extension")
    map: MapModel;

    // Sample "My Layers" data
    readonly myLayers: MyLayerItem[] = [
        {
            id: "custom-layer-1",
            title: "Water Distribution Network",
            description: "Custom water pipe network analysis layer",
            type: "Feature Layer",
            status: "Active"
        },
        {
            id: "custom-layer-2", 
            title: "Gas Pipeline Infrastructure",
            description: "Gas pipeline monitoring and maintenance layer",
            type: "Map Service",
            status: "Active"
        },
        {
            id: "custom-layer-3",
            title: "Electrical Grid Analysis",
            description: "Power distribution network analysis",
            type: "Feature Layer", 
            status: "Inactive"
        },
        {
            id: "custom-layer-4",
            title: "Telecommunication Cables",
            description: "Fiber optic and telecom cable infrastructure",
            type: "Feature Layer",
            status: "Active"
        },
        {
            id: "custom-layer-5",
            title: "Emergency Response Zones",
            description: "Critical infrastructure emergency response areas",
            type: "Map Service",
            status: "Active"
        }
    ];

    /**
     * Command to open the layer modal
     */
    @command("connectmaster-layer-modal.open")
    async openModal(): Promise<void> {
    }

    /**
     * Command to close the layer modal
     */
    @command("connectmaster-layer-modal.close")
    async closeModal(): Promise<void> {
    }

    /**
     * Show properties panel for a layer
     */
    async showLayerProperties(layer: LayerItem | MyLayerItem): Promise<void> {
        this.showToast(`Showing properties for: ${layer.title}`);
    }

    /**
     * Hide properties panel
     */
    async hideLayerProperties(): Promise<void> {
    }

    /**
     * Toggle layer visibility
     */
    async toggleLayerVisibility(layerId: string): Promise<void> {
        this.showToast(`Layer visibility toggled: ${layerId}`);
    }

    /**
     * Get all layers from the map (simplified for demo)
     */
    get mapLayers(): LayerItem[] {
        return [
            {
                id: "layer-1",
                title: "Victoria Neighbourhoods",
                type: "Feature Layer",
                visible: true,
                opacity: 1,
                description: "Neighbourhood boundaries for Victoria",
                url: "https://services.arcgis.com/p3UBboyC0NH1uCie/arcgis/rest/services/CapitalCity_Web_2_0/FeatureServer/3"
            },
            {
                id: "layer-2", 
                title: "Victoria Buildings",
                type: "Feature Layer",
                visible: true,
                opacity: 0.8,
                description: "Building footprints in Victoria",
                url: "https://services.arcgis.com/p3UBboyC0NH1uCie/arcgis/rest/services/CapitalCity_Web_2_0/FeatureServer/2"
            },
            {
                id: "layer-3",
                title: "Victoria Water Lines", 
                type: "Feature Layer",
                visible: false,
                opacity: 1,
                description: "Water distribution network",
                url: "https://services.arcgis.com/p3UBboyC0NH1uCie/arcgis/rest/services/CapitalCity_Web_2_0/FeatureServer/1"
            },
            {
                id: "layer-4",
                title: "Victoria Fire Hydrants",
                type: "Feature Layer",
                visible: true,
                opacity: 1,
                description: "Fire hydrant locations",
                url: "https://services.arcgis.com/p3UBboyC0NH1uCie/arcgis/rest/services/CapitalCity_Web_2_0/FeatureServer/0"
            }
        ];
    }

    /**
     * Remove a custom layer
     */
    async removeCustomLayer(layerId: string): Promise<void> {
        this.showToast(`Custom layer removed: ${layerId}`);
    }

    /**
     * Duplicate a custom layer
     */
    async duplicateCustomLayer(layer: MyLayerItem): Promise<void> {
        this.showToast(`Layer duplicated: ${layer.title}`);
    }

    /**
     * Show a toast notification
     */
    private showToast(message: string): void {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007ac3;
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
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
        
        toast.addEventListener('click', () => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        });
    }
} 