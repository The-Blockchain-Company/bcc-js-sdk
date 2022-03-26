export interface ExUnits {
  exUnitsMem: number;
  exUnitsSteps: number;
}

export interface AurumGenesis {
  bccPerUTxOWord: number;
  executionPrices: {
    prMem: number;
    prSteps: number;
  };
  maxTxExUnits: ExUnits;
  maxBlockExUnits: ExUnits;
  maxValueSize: number;
  collateralPercentage: number;
  maxCollateralInputs: number;
}
