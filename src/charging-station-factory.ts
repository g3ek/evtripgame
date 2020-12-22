import {ChargingStation} from "./charging-station";

export class ChargingStationFactory {

  static readonly CAPACITIES: number[] = [11000, 22000];

  create(distanceInMeters: number, slots: number): ChargingStation {
    const power: number = ChargingStationFactory.CAPACITIES[Math.floor(Math.random()*ChargingStationFactory.CAPACITIES.length)];
    const chargingStation = new ChargingStation();
    chargingStation.power = power;
    chargingStation.locationInMeters = distanceInMeters;
    chargingStation.slots = slots;
    return chargingStation;
  }
}
