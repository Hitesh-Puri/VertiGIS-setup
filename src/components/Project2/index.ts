import type { LibraryRegistry } from "@vertigis/web/config";

import ConnectMasterLayerModalModel from "./ConnectMasterLayerModalModel";
import ConnectMasterLayerPanel from "./ConnectMasterLayerPanel";

export { ConnectMasterLayerPanel };
export { ConnectMasterLayerModalModel };

export function registerProject2Components(registry: LibraryRegistry, namespace: string): void {
  registry.registerComponent({
    category: "layer",
    iconId: "layers",
    name: "connectmaster-layer-panel",
    namespace,
    getComponentType: () => ConnectMasterLayerPanel,
    itemType: "connectmaster-layer-panel",
    title: "ConnectMaster Layer Panel",
  });

  registry.registerModel({
    getModel: config => new ConnectMasterLayerModalModel(config),
    itemType: "connectmaster-layer-panel",
  });

  registry.registerCommand({
    name: "connectmaster-layer-modal.open",
    itemType: "connectmaster-layer-panel",
  });

  registry.registerCommand({
    name: "connectmaster-layer-modal.close",
    itemType: "connectmaster-layer-panel",
  });
}
