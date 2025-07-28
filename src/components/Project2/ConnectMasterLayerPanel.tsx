/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/order */
import type { LayoutElementProperties } from "@vertigis/web/components";
import { LayoutElement } from "@vertigis/web/components";
import { useWatchAndRerender } from "@vertigis/web/ui";
import Box from "@vertigis/web/ui/Box";
import DynamicIcon from "@vertigis/web/ui/DynamicIcon";
import IconButton from "@vertigis/web/ui/IconButton";
import ListItemText from "@vertigis/web/ui/ListItemText";
import MenuList from "@vertigis/web/ui/MenuList";
import MenuItem from "@vertigis/web/ui/MenuItem";
import MenuItemSecondaryAction from "@vertigis/web/ui/MenuItemSecondaryAction";
import Typography from "@vertigis/web/ui/Typography";
import React from "react";

import type ConnectMasterLayerModalModel from "./ConnectMasterLayerModalModel";
import type { APILayerItem } from "./ConnectMasterLayerModalModel";

interface ConnectMasterLayerPanelProps
  extends LayoutElementProperties<ConnectMasterLayerModalModel> {}

/**
 * ConnectMaster Layer Panel Component for sidebar integration
 */
export default function ConnectMasterLayerPanel(
  props: ConnectMasterLayerPanelProps
): React.ReactElement {
  const { model } = props;
  const [showPropertiesPanel, setShowPropertiesPanel] = React.useState(false);
  const [selectedLayer, setSelectedLayer] = React.useState<APILayerItem | null>(null);
  const [apiLayers, setApiLayers] = React.useState<APILayerItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editingRenderer, setEditingRenderer] = React.useState(false);
  const [tempColor, setTempColor] = React.useState<string>("#007ac3");
  const [tempSize, setTempSize] = React.useState<number>(6);

  useWatchAndRerender(model, ["apiLayers", "isLoading", "error"]);

  React.useEffect(() => {
    const loadApiData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await model.fetchApiLayers();
        setApiLayers(model.apiLayers);
        setError(model.error);
      } catch (err) {
        console.error("Error loading API data:", err);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadApiData();
  }, [model]);

  const handleShowProperties = async (layer: APILayerItem) => {
    setSelectedLayer(layer);
    setShowPropertiesPanel(true);
    await model.showLayerProperties(layer);
    // Update local state with any renderer information
    setApiLayers(model.apiLayers);

    // Set temporary values for editing
    if (layer.drawingInfo?.renderer) {
      setTempColor(model.getRendererColor(layer.drawingInfo.renderer));
      setTempSize(model.getRendererSize(layer.drawingInfo.renderer));
    } else {
      setTempColor("#007ac3");
      setTempSize(6);
    }
  };

  const handleHideProperties = async () => {
    setShowPropertiesPanel(false);
    setSelectedLayer(null);
    setEditingRenderer(false);
    await model.hideLayerProperties();
  };

  const handleLayerItemClick = async (layer: APILayerItem) => {
    // Zoom to layer extent when clicking on the layer item
    await model.zoomToLayer(layer);
  };

  const handleSaveRenderer = async () => {
    if (selectedLayer) {
      await model.updateLayerRenderer(selectedLayer.id, tempColor, tempSize);
      // Update local state
      setApiLayers(model.apiLayers);
      setEditingRenderer(false);
    }
  };

  const handleLayerAction = async (action: string, layer: APILayerItem) => {
    switch (action) {
      case "properties":
        await handleShowProperties(layer);
        break;
      case "add-to-map":
        await model.addApiLayerToMap(layer);
        break;
      case "load-renderer":
        {
          const details = await model.fetchLayerDetails(layer.id);
          if (details) {
            // Update the layer in our local state
            setApiLayers(prev =>
              prev.map(l => (l.id === layer.id ? { ...l, drawingInfo: details.drawingInfo } : l))
            );
          }
        }
        break;
      case "zoom-to-layer":
        await model.zoomToLayer(layer);
        break;
    }
  };

  const LayerActionsMenu: React.FC<{ layer: APILayerItem }> = ({ layer }) => {
    const [showMenu, setShowMenu] = React.useState(false);
    const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const handleAction = async (action: string) => {
      await handleLayerAction(action, layer);
      setShowMenu(false);
    };

    const handleMenuToggle = () => {
      if (!showMenu && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 4,
          left: rect.right - 180,
        });
      }
      setShowMenu(!showMenu);
    };

    return (
      <Box position="relative">
        <IconButton ref={buttonRef} onClick={handleMenuToggle} title="Layer Actions" size="small">
          <Box
            component="span"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              lineHeight: 1,
              fontWeight: "bold",
              color: "text.secondary",
              transform: "rotate(90deg)",
            }}
          >
            ⋯
          </Box>
        </IconButton>
        {showMenu && (
          <>
            <Box
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
              zIndex={9998}
              onClick={() => setShowMenu(false)}
            />
            <Box
              position="fixed"
              top={menuPosition.top}
              left={menuPosition.left}
              bgcolor="background.paper"
              border={1}
              borderColor="grey.300"
              borderRadius={1}
              boxShadow={3}
              zIndex={9999}
              minWidth={180}
              sx={{
                "& .MuiMenuItem-root": {
                  fontSize: "0.875rem",
                  padding: "8px 12px",
                },
              }}
            >
              <MenuList>
                <MenuItem onClick={() => handleAction("zoom-to-layer")}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DynamicIcon src="zoom-feature" />
                    <Typography variant="body2">Zoom to Layer</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAction("properties")}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DynamicIcon src="info" />
                    <Typography variant="body2">Properties</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAction("add-to-map")}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DynamicIcon src="plus" />
                    <Typography variant="body2">Add to Map</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleAction("load-renderer")}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DynamicIcon src="palette" />
                    <Typography variant="body2">Load Renderer</Typography>
                  </Box>
                </MenuItem>
              </MenuList>
            </Box>
          </>
        )}
      </Box>
    );
  };

  const RendererInfo: React.FC<{ layer: APILayerItem }> = ({ layer }) => {
    if (!layer.drawingInfo?.renderer) {
      return (
        <Typography variant="caption" color="textSecondary">
          No renderer loaded
        </Typography>
      );
    }

    const renderer = layer.drawingInfo.renderer;
    const color = model.getRendererColor(renderer);
    const size = model.getRendererSize(renderer);

    return (
      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
        <Box
          width={size}
          height={size}
          bgcolor={color}
          borderRadius="50%"
          border="1px solid #ccc"
        />
        <Typography variant="caption" color="textSecondary">
          Color: {color} • Size: {size}px
        </Typography>
      </Box>
    );
  };

  const LayerListItem: React.FC<{ layer: APILayerItem }> = ({ layer }) => (
    <MenuItem
      onClick={() => handleLayerItemClick(layer)}
      sx={{
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1} width="100%">
        <DynamicIcon src="layers" color="primary" />
        <ListItemText
          primary={layer.name}
          secondary={
            <Box>
              <Typography variant="caption" component="div">
                {layer.type} • ID: {layer.id}
              </Typography>
              <RendererInfo layer={layer} />
            </Box>
          }
        />
      </Box>
      <MenuItemSecondaryAction>
        <LayerActionsMenu layer={layer} />
      </MenuItemSecondaryAction>
    </MenuItem>
  );

  const LoadingComponent: React.FC = () => (
    <Box display="flex" flexDirection="column" alignItems="center" p={4}>
      <Box
        component="div"
        width={40}
        height={40}
        mb={2}
        sx={{
          border: "3px solid #f3f3f3",
          borderTop: "3px solid #007ac3",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      />
      <Typography variant="body2" color="textSecondary">
        Loading layers from API...
      </Typography>
    </Box>
  );

  const ErrorComponent: React.FC = () => (
    <Box display="flex" flexDirection="column" alignItems="center" p={4}>
      <Box
        bgcolor="error.light"
        color="error.contrastText"
        p={2}
        borderRadius={1}
        textAlign="center"
        maxWidth="100%"
      >
        <Typography variant="h6" gutterBottom>
          ⚠️ Error Loading Data
        </Typography>
        <Typography variant="body2" mb={2}>
          {error}
        </Typography>
        <Box
          component="button"
          bgcolor="error.main"
          color="error.contrastText"
          border="none"
          borderRadius={1}
          p={1}
          px={2}
          sx={{ cursor: "pointer" }}
          onClick={() => window.location.reload()}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <DynamicIcon src="refresh" />
            <Typography variant="body2">Retry</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const PropertiesDialog: React.FC = () => {
    if (!selectedLayer) return null;

    const layer = selectedLayer;

    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgcolor="rgba(0, 0, 0, 0.5)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={10000}
        onClick={handleHideProperties}
      >
        <Box
          bgcolor="background.paper"
          borderRadius={2}
          boxShadow={3}
          width="90vw"
          maxWidth={500}
          maxHeight="80vh"
          overflow="hidden"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <Box
            bgcolor="success.main"
            color="success.contrastText"
            p={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" color="inherit">
              Layer Properties
            </Typography>
            <IconButton onClick={handleHideProperties} color="inherit">
              <DynamicIcon src="close" />
            </IconButton>
          </Box>
          <Box p={3} overflow="auto" maxHeight="60vh">
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                General Information
              </Typography>
              <Box display="grid" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Name:
                  </Typography>
                  <Typography variant="body2">{layer.name}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Type:
                  </Typography>
                  <Typography variant="body2">{layer.type}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    ID:
                  </Typography>
                  <Typography variant="body2">{layer.id}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Description:
                  </Typography>
                  <Typography variant="body2">{layer.description || "N/A"}</Typography>
                </Box>
              </Box>
            </Box>

            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                API Layer Details
              </Typography>
              <Box display="grid" gap={1}>
                {layer.geometryType && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Geometry Type:
                    </Typography>
                    <Typography variant="body2">{layer.geometryType}</Typography>
                  </Box>
                )}
                {layer.defaultVisibility !== undefined && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Default Visibility:
                    </Typography>
                    <Typography variant="body2">
                      {layer.defaultVisibility ? "Yes" : "No"}
                    </Typography>
                  </Box>
                )}
                {layer.minScale && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Min Scale:
                    </Typography>
                    <Typography variant="body2">{layer.minScale}</Typography>
                  </Box>
                )}
                {layer.maxScale && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Max Scale:
                    </Typography>
                    <Typography variant="body2">{layer.maxScale}</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {layer.drawingInfo?.renderer && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Renderer Information</Typography>
                  {!editingRenderer ? (
                    <Box
                      component="button"
                      bgcolor="primary.main"
                      color="primary.contrastText"
                      border="none"
                      borderRadius={1}
                      p={1}
                      px={2}
                      sx={{ cursor: "pointer" }}
                      onClick={() => setEditingRenderer(true)}
                    >
                      <Typography variant="body2">Edit Style</Typography>
                    </Box>
                  ) : (
                    <Box display="flex" gap={1}>
                      <Box
                        component="button"
                        bgcolor="success.main"
                        color="success.contrastText"
                        border="none"
                        borderRadius={1}
                        p={1}
                        px={2}
                        sx={{ cursor: "pointer" }}
                        onClick={handleSaveRenderer}
                      >
                        <Typography variant="body2">Save</Typography>
                      </Box>
                      <Box
                        component="button"
                        bgcolor="grey.500"
                        color="white"
                        border="none"
                        borderRadius={1}
                        p={1}
                        px={2}
                        sx={{ cursor: "pointer" }}
                        onClick={() => setEditingRenderer(false)}
                      >
                        <Typography variant="body2">Cancel</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box display="grid" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Renderer Type:
                    </Typography>
                    <Typography variant="body2">{layer.drawingInfo.renderer.type}</Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="textSecondary">
                      Color:
                    </Typography>
                    {editingRenderer ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          component="input"
                          type="color"
                          value={tempColor}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTempColor(e.target.value)
                          }
                          sx={{
                            width: 30,
                            height: 25,
                            border: "none",
                            borderRadius: 1,
                            cursor: "pointer",
                          }}
                        />
                        <Typography variant="body2">{tempColor}</Typography>
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          width={16}
                          height={16}
                          bgcolor={model.getRendererColor(layer.drawingInfo.renderer)}
                          borderRadius="50%"
                          border="1px solid #ccc"
                        />
                        <Typography variant="body2">
                          {model.getRendererColor(layer.drawingInfo.renderer)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="textSecondary">
                      Size:
                    </Typography>
                    {editingRenderer ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          component="input"
                          type="range"
                          min="1"
                          max="50"
                          value={tempSize}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTempSize(Number(e.target.value))
                          }
                          sx={{
                            width: 100,
                          }}
                        />
                        <Typography variant="body2">{tempSize}px</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2">
                        {model.getRendererSize(layer.drawingInfo.renderer)}px
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <LayoutElement {...props} stretch>
      <Box display="flex" flexDirection="column" height="100%">
        <Box p={2} display="flex" flexDirection="column" height="100%" overflow="hidden">
          <Box flex={1} overflow="hidden">
            {isLoading ? (
              <LoadingComponent />
            ) : error ? (
              <ErrorComponent />
            ) : (
              <Box height="100%" display="flex" flexDirection="column">
                {apiLayers.length === 0 ? (
                  <Box display="flex" flexDirection="column" alignItems="center" p={4}>
                    <Typography variant="body2" color="textSecondary">
                      No layers found from the API endpoint.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    flex={1}
                    overflow="auto"
                    sx={{
                      "&::-webkit-scrollbar": {
                        width: "8px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "#f1f1f1",
                        borderRadius: "4px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#c1c1c1",
                        borderRadius: "4px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        background: "#a1a1a1",
                      },
                    }}
                  >
                    <MenuList>
                      {apiLayers.map(layer => (
                        <LayerListItem key={layer.id} layer={layer} />
                      ))}
                    </MenuList>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {showPropertiesPanel && <PropertiesDialog />}
      </Box>
    </LayoutElement>
  );
}
