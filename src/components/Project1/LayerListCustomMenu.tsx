import { LayoutElement } from "@vertigis/web/components";
import type { LayoutElementProperties } from "@vertigis/web/components";

import type LayerListCustomMenuModel from "./LayerListCustomMenuModel";
import "./LayerListCustomMenu.css";

interface LayerListCustomMenuProps extends LayoutElementProperties<LayerListCustomMenuModel> {}

/**
 * A simple component that provides custom layer list functionality
 */
export default function LayerListCustomMenu(props: LayerListCustomMenuProps): React.ReactElement {
  const { model } = props;

  return (
    <LayoutElement {...props}>
      <div className="layer-list-custom-menu">
        <span className="layer-list-custom-menu__title">Custom Layer Menu</span>
        <button
          className="layer-list-custom-menu__button"
          onClick={() => model.executeCustomCommand()}
          title="Execute Command"
        >
          Execute Command
        </button>
      </div>
    </LayoutElement>
  );
}
