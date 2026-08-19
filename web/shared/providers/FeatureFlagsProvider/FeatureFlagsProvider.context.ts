import { createContext } from "react";

import { IFeatureFlagsStrategy } from "./strategies/strategy.interfaces";

export const FeatureFlagsContext = createContext<IFeatureFlagsStrategy | null>(null);
