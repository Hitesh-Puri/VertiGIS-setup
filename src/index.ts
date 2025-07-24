import type { LibraryRegistry } from "@vertigis/web/config";

import { registerPointsOfInterestComponents } from "./components/PointsOfInterest";
import { registerProject1Components } from "./components/Project1";
import { registerProject2Components } from "./components/Project2";

const LAYOUT_NAMESPACE = "custom.92a1b683";

export default function (registry: LibraryRegistry): void {
    registerPointsOfInterestComponents(registry, LAYOUT_NAMESPACE);
    registerProject1Components(registry, LAYOUT_NAMESPACE);
    registerProject2Components(registry, LAYOUT_NAMESPACE);
}
