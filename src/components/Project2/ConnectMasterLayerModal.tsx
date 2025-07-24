/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import type { LayoutElementProperties } from "@vertigis/web/components";
import { LayoutElement } from "@vertigis/web/components";
import React from "react";

import type ConnectMasterLayerModalModel from "./ConnectMasterLayerModalModel";
import type { LayerItem, MyLayerItem } from "./ConnectMasterLayerModalModel";
import "./ConnectMasterLayerModal.css";

interface ConnectMasterLayerModalProps extends LayoutElementProperties<ConnectMasterLayerModalModel> {}

/**
 * ConnectMaster Layer Modal Component for layer management
 */
export default function ConnectMasterLayerModal(props: ConnectMasterLayerModalProps): React.ReactElement {
    const { model } = props;
    const [activeTab, setActiveTab] = React.useState<'map-layers' | 'my-layers'>('map-layers');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [showPropertiesPanel, setShowPropertiesPanel] = React.useState(false);
    const [selectedLayer, setSelectedLayer] = React.useState<LayerItem | MyLayerItem | null>(null);

    const handleOpenModal = async () => {
        setIsModalOpen(true);
        await model.openModal();
    };

    const handleCloseModal = async () => {
        setIsModalOpen(false);
        setShowPropertiesPanel(false);
        setSelectedLayer(null);
        await model.closeModal();
    };

    const handleShowProperties = async (layer: LayerItem | MyLayerItem) => {
        setSelectedLayer(layer);
        setShowPropertiesPanel(true);
        await model.showLayerProperties(layer);
    };

    const handleHideProperties = async () => {
        setShowPropertiesPanel(false);
        setSelectedLayer(null);
        await model.hideLayerProperties();
    };

    const handleLayerAction = async (action: string, layer: LayerItem | MyLayerItem) => {
        switch (action) {
            case 'properties':
                await handleShowProperties(layer);
                break;
            case 'visibility':
                if ('visible' in layer) {
                    await model.toggleLayerVisibility(layer.id);
                }
                break;
            case 'remove':
                if ('status' in layer) {
                    await model.removeCustomLayer(layer.id);
                }
                break;
            case 'duplicate':
                if ('status' in layer) {
                    await model.duplicateCustomLayer(layer as MyLayerItem);
                }
                break;
        }
    };

    const LayerActionsMenu: React.FC<{ layer: LayerItem | MyLayerItem, onAction: (action: string) => void }> = ({ layer, onAction }) => {
        const [showMenu, setShowMenu] = React.useState(false);
        const isMyLayer = 'status' in layer;
        
        return (
            <div className="layer-actions">
                <button 
                    className="layer-actions-trigger"
                    onClick={() => setShowMenu(!showMenu)}
                    title="Layer Actions"
                >
                    ⋮
                </button>
                {showMenu && (
                    <div className="layer-actions-menu">
                        <button onClick={() => { onAction('properties'); setShowMenu(false); }}>
                            🔍 Properties
                        </button>
                        {!isMyLayer && (
                            <button onClick={() => { onAction('visibility'); setShowMenu(false); }}>
                                👁️ Toggle Visibility
                            </button>
                        )}
                        {isMyLayer && (
                            <>
                                <button onClick={() => { onAction('duplicate'); setShowMenu(false); }}>
                                    📋 Duplicate
                                </button>
                                <button onClick={() => { onAction('remove'); setShowMenu(false); }} className="danger">
                                    🗑️ Remove
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const LayerRow: React.FC<{ layer: LayerItem | MyLayerItem }> = ({ layer }) => {
        const isMyLayer = 'status' in layer;
        
        return (
            <div className="layer-row">
                <div className="layer-info">
                    <div className="layer-title">{layer.title}</div>
                    <div className="layer-details">
                        <span className="layer-type">{layer.type}</span>
                        {isMyLayer && (
                            <span className={`layer-status ${(layer as MyLayerItem).status.toLowerCase()}`}>
                                {(layer as MyLayerItem).status}
                            </span>
                        )}
                        {!isMyLayer && (
                            <span className={`layer-visibility ${(layer as LayerItem).visible ? 'visible' : 'hidden'}`}>
                                {(layer as LayerItem).visible ? 'Visible' : 'Hidden'}
                            </span>
                        )}
                    </div>
                    <div className="layer-description">{layer.description || 'No description available'}</div>
                </div>
                <LayerActionsMenu 
                    layer={layer} 
                    onAction={(action) => handleLayerAction(action, layer)} 
                />
            </div>
        );
    };

    const PropertiesPanel: React.FC = () => {
        if (!selectedLayer) return null;
        
        const layer = selectedLayer;
        const isMyLayer = 'status' in layer;
        
        return (
            <div className="properties-panel">
                <div className="properties-header">
                    <h3>Layer Properties</h3>
                    <button className="close-button" onClick={handleHideProperties}>×</button>
                </div>
                <div className="properties-content">
                    <div className="property-group">
                        <h4>General Information</h4>
                        <div className="property-item">
                            <label>Name:</label>
                            <span>{layer.title}</span>
                        </div>
                        <div className="property-item">
                            <label>Type:</label>
                            <span>{layer.type}</span>
                        </div>
                        <div className="property-item">
                            <label>Description:</label>
                            <span>{layer.description}</span>
                        </div>
                        <div className="property-item">
                            <label>ID:</label>
                            <span>{layer.id}</span>
                        </div>
                    </div>
                    
                    {!isMyLayer && (
                        <div className="property-group">
                            <h4>Display Settings</h4>
                            <div className="property-item">
                                <label>Visible:</label>
                                <span>{(layer as LayerItem).visible ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="property-item">
                                <label>Opacity:</label>
                                <span>{Math.round((layer as LayerItem).opacity * 100)}%</span>
                            </div>
                            {(layer as LayerItem).url && (
                                <div className="property-item">
                                    <label>URL:</label>
                                    <span className="url">{(layer as LayerItem).url}</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {isMyLayer && (
                        <div className="property-group">
                            <h4>Custom Layer Settings</h4>
                            <div className="property-item">
                                <label>Status:</label>
                                <span className={`status ${(layer as MyLayerItem).status.toLowerCase()}`}>
                                    {(layer as MyLayerItem).status}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <LayoutElement {...props}>
            <div className="connectmaster-layer-modal-container">
                <button 
                    className="open-modal-button"
                    onClick={handleOpenModal}
                    title="Open Layer Management"
                >
                    📋 Manage Layers
                </button>
                
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <div className="modal-header">
                                <h2>🌐 ConnectMaster Layer Management</h2>
                                <button className="close-button" onClick={handleCloseModal}>×</button>
                            </div>
                            
                            <div className="modal-content">
                                <div className="layer-tabs">
                                    <button 
                                        className={`tab-button ${activeTab === 'map-layers' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('map-layers')}
                                    >
                                        🗺️ Map Layers ({model.mapLayers.length})
                                    </button>
                                    <button 
                                        className={`tab-button ${activeTab === 'my-layers' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('my-layers')}
                                    >
                                        📁 My Layers ({model.myLayers.length})
                                    </button>
                                </div>
                                
                                <div className="layers-container">
                                    {activeTab === 'map-layers' && (
                                        <div className="layers-list">
                                            <div className="layers-header">
                                                <h3>Map Layers</h3>
                                                <p>Layers currently available in the map</p>
                                            </div>
                                            {model.mapLayers.map(layer => (
                                                <LayerRow key={layer.id} layer={layer} />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {activeTab === 'my-layers' && (
                                        <div className="layers-list">
                                            <div className="layers-header">
                                                <h3>My Custom Layers</h3>
                                                <p>Your custom ConnectMaster network analysis layers</p>
                                            </div>
                                            {model.myLayers.map(layer => (
                                                <LayerRow key={layer.id} layer={layer} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {showPropertiesPanel && <PropertiesPanel />}
                    </div>
                )}
            </div>
        </LayoutElement>
    );
} 