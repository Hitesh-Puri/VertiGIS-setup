import type { LayoutElementProperties } from "@vertigis/web/components";
import { LayoutElement } from "@vertigis/web/components";
import Box from "@vertigis/web/ui/Box";
import Button from "@vertigis/web/ui/Button";

import type AddLocationLayerModel from "./AddLocationLayerModel";

export default function AddLocationLayer(props: LayoutElementProperties<AddLocationLayerModel>) {
  const { model } = props;

  const handleAddLocationLayers = async () => {
    // eslint-disable-next-line no-void
    void model.addLocationLayers();
  };

  return (
    <LayoutElement {...props}>
      <Box style={{ padding: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Button variant="contained" color="primary" onClick={handleAddLocationLayers} size="small">
          Add Location Layers
        </Button>
      </Box>
    </LayoutElement>
  );
}
