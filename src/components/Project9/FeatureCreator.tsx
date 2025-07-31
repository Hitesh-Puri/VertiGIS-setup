/* eslint-disable @typescript-eslint/no-floating-promises */
import type { LayoutElementProperties } from "@vertigis/web/components";
import { LayoutElement } from "@vertigis/web/components";
import { useWatchAndRerender } from "@vertigis/web/ui";
import Box from "@vertigis/web/ui/Box";
import Button from "@vertigis/web/ui/Button";
import FormControl from "@vertigis/web/ui/FormControl";
import MenuItem from "@vertigis/web/ui/MenuItem";
import Select from "@vertigis/web/ui/Select";
import Typography from "@vertigis/web/ui/Typography";
import DynamicIcon from "@vertigis/web/ui/DynamicIcon";
import { useEffect, useState } from "react";

import "./FeatureCreator.css";
import type FeatureCreatorModel from "./FeatureCreatorModel";

export default function FeatureCreator(props: LayoutElementProperties<FeatureCreatorModel>) {
  const { model } = props;
  useWatchAndRerender(model, "selectedGeometryType");
  useWatchAndRerender(model, "isDrawing");
  useWatchAndRerender(model, "featureLayers");
  useWatchAndRerender(model, "selectedLayer");

  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featureType, setFeatureType] = useState("");

  useEffect(() => {
    model.initialize();
  }, [model]);

  const handleGeometryTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const type = event.target.value as "point" | "polyline" | "polygon";
    model.setGeometryType(type);
  };

  const handleLayerChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const layerId = event.target.value as string;
    const layer = model.featureLayers.find(l => l.id === layerId) || null;
    model.selectLayer(layer);
  };

  const handleStartDrawing = async () => {
    await model.startDrawing();
  };

  const handleStopDrawing = async () => {
    await model.stopDrawing();
  };

  const handleCreateHardcodedFeature = async () => {
    // Update model attributes before creating feature
    model.setFeatureAttributes({
      name: featureName,
      description: featureDescription,
      type: featureType,
    });

    await model.createHardcodedFeature();
  };

  const handleAddDrawnFeature = async () => {
    // Update model attributes before adding feature
    model.setFeatureAttributes({
      name: featureName,
      description: featureDescription,
      type: featureType,
    });

    await model.addFeatureFromDrawing();
  };

  return (
    <LayoutElement {...props}>
      <Box className="feature-creator-container">
        <Typography variant="h6" className="feature-creator-title">
          {/* <DynamicIcon src="add-location" /> */}
          Feature Creator
        </Typography>

        {/* Geometry Type Selection */}
        <Box className="feature-creator-section">
          <Typography variant="subtitle1">Geometry Type</Typography>
          <FormControl fullWidth size="small">
            <Typography variant="body2">Select Geometry Type</Typography>
            <Select
              value={model.selectedGeometryType}
              onChange={(e: any) => handleGeometryTypeChange(e)}
              label="Select Geometry Type"
            >
              <MenuItem value="point">
                {/* <DynamicIcon src="place" /> */}
                Point
              </MenuItem>
              <MenuItem value="polyline">
                {/* <DynamicIcon src="timeline" /> */}
                Polyline
              </MenuItem>
              <MenuItem value="polygon">
                {/* <DynamicIcon src="crop_square" /> */}
                Polygon
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Feature Layer Selection */}
        <Box className="feature-creator-section">
          <Typography variant="subtitle1">Target Layer</Typography>
          <FormControl fullWidth size="small">
            <Typography variant="body2">Select Feature Layer</Typography>
            <Select
              value={model.selectedLayer?.id || ""}
              onChange={(e: any) => handleLayerChange(e)}
              label="Select Feature Layer"
            >
              {model.featureLayers.map(layer => (
                <MenuItem key={layer.id} value={layer.id}>
                  {/* <DynamicIcon src="layers" /> */}
                  {layer.title || layer.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Feature Attributes */}
        <Box className="feature-creator-section">
          <Typography variant="subtitle1">Feature Attributes</Typography>
          <Box className="input-group">
            <Typography variant="body2" className="input-label">
              Feature Name
            </Typography>
            <input
              type="text"
              value={featureName}
              onChange={e => setFeatureName(e.target.value)}
              placeholder="Enter feature name"
              className="custom-input"
            />
          </Box>
          <Box className="input-group">
            <Typography variant="body2" className="input-label">
              Description
            </Typography>
            <textarea
              value={featureDescription}
              onChange={e => setFeatureDescription(e.target.value)}
              placeholder="Enter description"
              className="custom-textarea"
              rows={2}
            />
          </Box>
          <Box className="input-group">
            <Typography variant="body2" className="input-label">
              Type
            </Typography>
            <input
              type="text"
              value={featureType}
              onChange={e => setFeatureType(e.target.value)}
              placeholder="Enter feature type"
              className="custom-input"
            />
          </Box>
        </Box>

        {/* Drawing Controls */}
        <Box className="feature-creator-section">
          <Typography variant="subtitle1">Drawing Tools</Typography>
          <Box className="drawing-controls">
            {!model.isDrawing ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleStartDrawing}
                // startIcon={<DynamicIcon src="edit" />}
                fullWidth
              >
                Start Drawing {model.selectedGeometryType}
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleStopDrawing}
                // startIcon={<DynamicIcon src="stop" />}
                fullWidth
              >
                Stop Drawing
              </Button>
            )}
          </Box>
        </Box>

        {/* Feature Creation Buttons */}
        <Box className="feature-creator-section">
          <Typography variant="subtitle1">Create Features</Typography>
          <Box className="feature-buttons">
            <Button
              variant="contained"
              color="success"
              onClick={handleCreateHardcodedFeature}
              // startIcon={<DynamicIcon src="add" />}
              fullWidth
              style={{ marginBottom: 8 }}
            >
              Create Hardcoded Feature
            </Button>

            <Button
              variant="contained"
              color="info"
              onClick={handleAddDrawnFeature}
              // startIcon={<DynamicIcon src="draw" />}
              fullWidth
              disabled={!model.isDrawing}
            >
              Add Drawn Feature
            </Button>
          </Box>
        </Box>

        {/* Status Information */}
        <Box className="feature-creator-section">
          <Typography variant="caption" color="textSecondary">
            {/* <DynamicIcon src="info" sizes="small" /> */}
            Selected: {model.selectedGeometryType} | Layer: {model.selectedLayer?.title || "None"} |
            Status: {model.isDrawing ? "Drawing" : "Ready"}
          </Typography>
        </Box>
      </Box>
    </LayoutElement>
  );
}
