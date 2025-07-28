import React from "react";
import { LayoutElement, LayoutElementProperties } from "@vertigis/web/components";
import GeometricLocationModel from "./GeometricLocationModel";

interface GeometricLocationProps extends LayoutElementProperties<GeometricLocationModel> {}

/**
 * GeometricLocation component - provides context menu functionality
 * This component doesn't render visible UI, just provides the model for context menu actions
 */
export default function GeometricLocation(props: GeometricLocationProps): React.ReactElement {
  return (
    <LayoutElement {...props}>
      {/* No visible UI - this component provides context menu functionality */}
      <div style={{ display: "none" }}>Geometric Location Context Menu Provider</div>
    </LayoutElement>
  );
}
