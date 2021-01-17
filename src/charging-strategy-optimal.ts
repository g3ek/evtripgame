import {AbstractChargingStrategy, Strategy} from "./charging-strategy";
import {ChargingStation} from "./charging-station";
import {Vehicle} from "./vehicle";
import {RouteGraphics} from "./route-graphics";

/**
 * Stop for charging when less than throttle threshold
 * Stop charging when throttling begins
 */
export class ChargingStrategyOptimal extends AbstractChargingStrategy {

  determineChargingNeed(chargingStations: ChargingStation[], vehicle: Vehicle, chargingStation: ChargingStation, newDistance: number): boolean {
    let distanceRemaining = RouteGraphics.DISTANCE_METRES - newDistance;
    const energyNeeds = (vehicle.consumption / 1000) * distanceRemaining;
    if (vehicle.soc - energyNeeds > 0) {
      return false; // I can make it to the end
    } else if (vehicle.soc > vehicle.throttleThreshold) { // throttle starting, time to look for next one
      let nextChargingStations = this.findNextChargingStations(chargingStations, chargingStation);
      let stopAtNextOne = nextChargingStations.some(cs => {
        let distanceTo = cs.locationInMeters - newDistance;
        let energyTo = (vehicle.consumption / 1000) * distanceTo;
        return vehicle.soc - energyTo > 0; // can I make it over there? If yes then continue or stop charging
      });
      return !stopAtNextOne;
    } else { // less than throttle, continue or start charging
      return true;
    }
  }

  type(): Strategy {
    return Strategy.OPTIMAL;
  }

}
