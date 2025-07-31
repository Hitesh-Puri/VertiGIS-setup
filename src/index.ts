import type { LibraryRegistry } from "@vertigis/web/config";

import { registerProject1Components } from "./components/Project1";
import { registerProject10Components } from "./components/Project10";
import { registerProject2Components } from "./components/Project2";
import { registerProject4Components } from "./components/Project4";
import { registerProject6Components } from "./components/Project6";
import { registerProject9Components } from "./components/Project9";

const LAYOUT_NAMESPACE = "custom.92a1b683";

export default function (registry: LibraryRegistry): void {
  registerProject1Components(registry, LAYOUT_NAMESPACE);
  registerProject2Components(registry, LAYOUT_NAMESPACE);
  registerProject4Components(registry, LAYOUT_NAMESPACE);
  registerProject6Components(registry, LAYOUT_NAMESPACE);
  registerProject9Components(registry, LAYOUT_NAMESPACE);
  registerProject10Components(registry, LAYOUT_NAMESPACE);
}
