/* eslint-disable import/order */
import type { LibraryRegistry } from "@vertigis/web/config";
import PointsOfInterestModel from "./PointsOfInterestModel";
import PointsOfInterest from "./PointsOfInterest";

export { default } from "./PointsOfInterest";
export { PointsOfInterestModel };

export function registerPointsOfInterestComponents(registry: LibraryRegistry, namespace: string): void {
    // Register PointsOfInterest component
    registry.registerComponent({
        category: "map",
        iconId: "station-locator",
        name: "points-of-interest",
        namespace,
        getComponentType: () => PointsOfInterest,
        itemType: "points-of-interest-model",
        title: "Points of Interest",
    });
    registry.registerModel({
        getModel: config => new PointsOfInterestModel(config),
        itemType: "points-of-interest-model",
    });
    registry.registerCommand({
        name: "points-of-interest.create",
        itemType: "points-of-interest-model",
    });
}
