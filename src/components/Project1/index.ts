import type { LibraryRegistry } from "@vertigis/web/config";

import LayerListCustomMenu from "./LayerListCustomMenu";
import LayerListCustomMenuModel from "./LayerListCustomMenuModel";

export { default } from "./LayerListCustomMenu";
export { LayerListCustomMenuModel };

export function registerProject1Components(registry: LibraryRegistry, namespace: string): void {
  registry.registerComponent({
    category: "layer",
    iconId: "layers",
    name: "layer-list-custom-menu",
    namespace,
    getComponentType: () => LayerListCustomMenu,
    itemType: "layer-list-custom-menu-model",
    title: "Layer List Custom Menu",
  });

  registry.registerModel({
    getModel: config => new LayerListCustomMenuModel(config),
    itemType: "layer-list-custom-menu-model",
  });

  registry.registerCommand({
    name: "layer-list-custom-menu.execute",
    itemType: "layer-list-custom-menu-model",
  });
}
