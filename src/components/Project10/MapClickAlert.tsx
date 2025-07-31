import type { LayoutElementProperties } from "@vertigis/web/components";
import { LayoutElement } from "@vertigis/web/components";
import type { ComponentModel } from "@vertigis/web/models";
import Box from "@vertigis/web/ui/Box";
import Typography from "@vertigis/web/ui/Typography";

interface MapClickAlertProps extends LayoutElementProperties<ComponentModel> {}

export default function MapClickAlert(props: MapClickAlertProps) {
  const { model } = props;

  return (
    <LayoutElement {...props}>
      <Box>
        <Typography>Map Click Alert</Typography>
      </Box>
    </LayoutElement>
  );
}
