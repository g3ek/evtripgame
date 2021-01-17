import {Vehicle} from "./vehicle";
import {ChargingStation} from "./charging-station";

export enum Strategy {
  OPPORTUNISTIC,
  ANXIETY,
  OPTIMAL
}

export interface ChargingStrategy {

  determineChargingNeed(chargingStations: ChargingStation[], vehicle: Vehicle, chargingStation: ChargingStation, newDistance: number): boolean;

  type(): Strategy;
}

export abstract class AbstractChargingStrategy implements ChargingStrategy {

  static strategies: Strategy[] = [Strategy.OPPORTUNISTIC, Strategy.ANXIETY, Strategy.OPTIMAL];

  abstract determineChargingNeed(chargingStations: ChargingStation[], vehicle: Vehicle, chargingStation: ChargingStation, newDistance: number): boolean;

  abstract type(): Strategy;

  protected findNextChargingStations(chargingStations: ChargingStation[], chargingStation: ChargingStation): ChargingStation[] {
    return chargingStations.filter(cs => {
      return cs.locationInMeters > chargingStation.locationInMeters;
    }).map(cs => {
      return cs;
    });
  }

  static getLabel(strategy: Strategy): string {
    switch (strategy) {
      case Strategy.OPPORTUNISTIC:
        return "Opportunistic";
      case Strategy.ANXIETY:
        return "Anxiety";
      case Strategy.OPTIMAL:
        return "Optimal";
      default:
        throw "Illegal argument: "+strategy;
    }
  }
}
