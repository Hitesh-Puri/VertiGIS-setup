import type { LibraryRegistry } from "@vertigis/web/config";
import ConnectMasterLayerModal from "./ConnectMasterLayerModal";
import ConnectMasterLayerModalModel from "./ConnectMasterLayerModalModel";

export { default } from "./ConnectMasterLayerModal";
export { ConnectMasterLayerModalModel };

export function registerProject2Components(registry: LibraryRegistry, namespace: string): void {
    registry.registerComponent({
        category: "layer",
        iconId: "layers-add",
        name: "connectmaster-layer-modal",
        namespace,
        getComponentType: () => ConnectMasterLayerModal,
        itemType: "connectmaster-layer-modal-model",
        title: "ConnectMaster Layer Modal",
    });
    registry.registerModel({
        getModel: config => new ConnectMasterLayerModalModel(config),
        itemType: "connectmaster-layer-modal-model",
    });
    registry.registerCommand({
        name: "connectmaster-layer-modal.open",
        itemType: "connectmaster-layer-modal-model",
    });
    registry.registerCommand({
        name: "connectmaster-layer-modal.close",
        itemType: "connectmaster-layer-modal-model",
    });
} 