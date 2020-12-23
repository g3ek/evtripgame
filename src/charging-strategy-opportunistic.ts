import {AbstractChargingStrategy, Strategy} from "./charging-strategy";
import {Vehicle} from "./vehicle";
import {ChargingStation} from "./charging-station";
import {RouteGraphics} from "./route-graphics";

/**
 * Stop for charge when no other station ahead in range
 * Stop charging when in range of other station
 */
export class ChargingStrategyOpportunistic extends AbstractChargingStrategy{

  type(): Strategy {
    return Strategy.OPPORTUNISTIC;
  }

  determineChargingNeed(chargingStations: ChargingStation[], vehicle: Vehicle, chargingStation: ChargingStation, newDistance: number): boolean {
    let distanceRemaining = RouteGraphics.DISTANCE_METRES - newDistance;
    const energyNeeds = (vehicle.consumption / 1000) * distanceRemaining;
    if (vehicle.soc - energyNeeds < 0) {
      let nextChargingStations = this.findNextChargingStations(chargingStations, chargingStation);
      let stopAtNextOne = nextChargingStations.some(cs => {
        let distanceTo = cs.locationInMeters - newDistance;
        let energyTo = (vehicle.consumption / 1000) * distanceTo;
        return vehicle.soc - energyTo > 0; // can I make it over there?
      });
      return !stopAtNextOne;
    } else {
      console.log("i have enough soc: "+ vehicle.soc +", energyneeds: "+energyNeeds)
    }
    return false; // todo: should not happen, otherwise no challenge! ;-)
  }

}
