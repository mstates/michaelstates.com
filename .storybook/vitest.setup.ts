import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react-vite";

import * as projectAnnotations from "./preview";

// Apply the project-level annotations from preview.ts (global CSS/tokens and the
// a11y "error" parameter) to every story-as-test run.
const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
