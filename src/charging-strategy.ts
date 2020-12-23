import {Vehicle} from "./vehicle";
import {ChargingStation} from "./charging-station";
import {ChargingStrategyAnxiety} from "./charging-strategy-anxiety";
import {ChargingStrategyOpportunistic} from "./charging-strategy-opportunistic";

export enum Strategy {
  OPPORTUNISTIC,
  ANXIETY
}

export interface ChargingStrategy {

  determineChargingNeed(chargingStations: ChargingStation[], vehicle: Vehicle, chargingStation: ChargingStation, newDistance: number): boolean;

  type(): Strategy;
}

export abstract class AbstractChargingStrategy implements ChargingStrategy {

  static strategies: Strategy[] = [Strategy.OPPORTUNISTIC, Strategy.ANXIETY];

  abstract determineChargingNeed(chargingStations: ChargingStation[], vehicle: Vehicle, chargingStation: ChargingStation, newDistance: number): boolean;

  abstract type(): Strategy;

  protected findNextChargingStations(chargingStations: ChargingStation[], chargingStation: ChargingStation): ChargingStation[] {
    return chargingStations.filter(cs => {
      return cs.locationInMeters > chargingStation.locationInMeters;
    }).map(cs => {
      return cs;
    });
  }

  static createStrategy(strategy: Strategy): ChargingStrategy {
    switch (strategy) {
      case Strategy.ANXIETY:
        return new ChargingStrategyAnxiety();
      case Strategy.OPPORTUNISTIC:
        return new ChargingStrategyOpportunistic();
      default:
        throw "Illegal argument: "+strategy;
    }
  }
}
