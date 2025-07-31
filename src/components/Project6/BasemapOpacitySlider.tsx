/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { LayoutElement, type LayoutElementProperties } from "@vertigis/web/components";
import { useWatchAndRerender } from "@vertigis/web/ui";
import Box from "@vertigis/web/ui/Box";
import Slider from "@vertigis/web/ui/Slider";
import Typography from "@vertigis/web/ui/Typography";
import { useEffect } from "react";

import "./BasemapOpacitySlider.css";
import type BasemapOpacitySliderModel from "./BasemapOpacitySliderModel";

const BasemapOpacitySlider = (props: LayoutElementProperties<BasemapOpacitySliderModel>) => {
  const { model } = props;

  useWatchAndRerender(model, "opacity");

  useEffect(() => {
    model.initialize();
  }, [model]);

  return (
    <LayoutElement {...props}>
      <Box className="basemap-opacity-slider-container">
        <Typography variant="h6" className="basemap-opacity-title">
          Basemap Opacity
        </Typography>

        <Box className="basemap-opacity-controls">
          <Box className="slider-container">
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={model.opacity}
              onChange={(e, value: number) => {
                void model.handleOpacityChange(value);
              }}
              className="basemap-opacity-slider"
            />
          </Box>

          <Box className="percentage-display">
            <Typography variant="body2" className="percentage-text">
              {model.getOpacityPercentage()}
            </Typography>
          </Box>
        </Box>

        <Box className="opacity-labels">
          <Typography variant="caption" className="opacity-label">
            Transparent
          </Typography>
          <Typography variant="caption" className="opacity-label">
            Opaque
          </Typography>
        </Box>
      </Box>
    </LayoutElement>
  );
};

export default BasemapOpacitySlider;
