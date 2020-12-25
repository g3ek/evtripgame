import {AbstractChargingStrategy, Strategy} from "./charging-strategy";
import {ChargingStation} from "./charging-station";
import {Vehicle} from "./vehicle";

/**
 * ALways:
 * Pick the first charging station regardless of SoC
 * Stay until 100% soc
 */
export class ChargingStrategyAnxiety extends AbstractChargingStrategy {

  determineChargingNeed(chargingStations: ChargingStation[], vehicle: Vehicle, chargingStation: ChargingStation, newDistance: number): boolean {
    return true;
  }

  type(): Strategy {
    return Strategy.ANXIETY;
  }

}
