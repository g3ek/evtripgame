import {RouteGraphics} from "./route-graphics";
import {Status, Vehicle} from "./vehicle";
import {ChargingStation} from "./charging-station";
import {Clock} from "./clock";

export class Controller {

  static TIMEFACTOR: number = 20;

  private _vehicles: Vehicle[] = [];
  private chargingStations: ChargingStation[] = [];
  private routeGraphics: RouteGraphics;
  private clock: Clock;

  constructor(routeGraphics: RouteGraphics, clock: Clock) {
    this.routeGraphics = routeGraphics;
    this.clock = clock;
  }

  addVehicle(vehicle: Vehicle): void {
    this._vehicles.push(vehicle);
  }

  addChargingStation(chargingStation: ChargingStation) {
    this.chargingStations.push(chargingStation);
  }

  update(delta: number): void {
    this._vehicles.forEach(vehicle => {
      this.updateVehicle(vehicle);
    });
    this.chargingStations.forEach(cs => {
      if (cs.vehicles.length > 0) {
        this.chargeVehicles(cs);
      }
    })
  }

  get vehicles(): Vehicle[] {
    return this._vehicles;
  }

  private updateVehicle(vehicle: Vehicle) {
    if (vehicle.status === Status.MOVING) {
      const delta = (this.clock.time - vehicle.startTime);
      const distance = (delta / 1000) * vehicle.mpsSpeed;
      // /1000 b/c consumtion is per km
      const wattHoursPerMeter = (vehicle.consumption / 1000) * distance;
      let soc = vehicle.startSOC - wattHoursPerMeter;
      vehicle.soc = soc;
      const needToCharge = this.isChargingNecessaryHandler(vehicle, distance);
      if (!needToCharge) {
        vehicle.distance = distance;
        if (vehicle.totalDistance > RouteGraphics.DISTANCE_METRES) {
          this.routeGraphics.removeVehicle(vehicle);
          this._vehicles = this._vehicles.filter(v => v !== vehicle);
        }
      }
    }
  }

  private isChargingNecessaryHandler(vehicle: Vehicle, distance: number): boolean {
    const oldDistance = vehicle.totalDistance; // previously attained distance
    const newDistance = vehicle.startDistance + distance;
    const nearestChargingStations = this.chargingStations.filter(chargingStation => {
      let csLocation = chargingStation.locationInMeters;
      return csLocation > oldDistance && csLocation < newDistance;
    });
    if (nearestChargingStations.length > 0) {
      const chargingStation = nearestChargingStations[0];
      let doNeedToChargeHere = this.doINeedToChargeHere(vehicle, chargingStation, newDistance);
      if (doNeedToChargeHere) {
        vehicle.status = Status.CHARGING;
        vehicle.startDistance = chargingStation.locationInMeters;
        vehicle.distance = 0;
        this.afterChargingOrMoving(vehicle);
        chargingStation.add(vehicle);
        this.routeGraphics.renderChargingVehicle(vehicle, chargingStation);
        return true;
      }
    }
    return false;
  }

  private doINeedToChargeHere(vehicle: Vehicle, chargingStation: ChargingStation, newDistance: number): boolean {
    let distanceRemaining = RouteGraphics.DISTANCE_METRES - newDistance;
    const energyNeeds = (vehicle.consumption / 1000) * distanceRemaining;
    if (vehicle.soc - energyNeeds < 0) {
      let nextChargingStations = this.findNextChargingStations(chargingStation);
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

  private findNextChargingStations(chargingStation: ChargingStation): ChargingStation[] {
    return this.chargingStations.filter(cs => {
      return cs.locationInMeters > chargingStation.locationInMeters;
    }).map(cs => {
      return cs;
    });
  }

  private chargeVehicles(chargingStation: ChargingStation) {
    for (let i = 0; i < chargingStation.vehicles.length; i++) {
      const vehicle = chargingStation.vehicles[i];
      const chargingTime = (this.clock.time - vehicle.startTime);
      // 3600000 to convert hour to ms
      const energy = (chargingStation.power / 3600000) * chargingTime;
      vehicle.soc = vehicle.startSOC + energy;
      if (vehicle.soc >= vehicle.capacity) {
        vehicle.soc = vehicle.capacity;
        this.stopCharging(vehicle, chargingStation);
      }
      let doINeedToContinueChargingHere = this.doINeedToChargeHere(vehicle, chargingStation, vehicle.totalDistance);
      if (!doINeedToContinueChargingHere) {
        this.stopCharging(vehicle, chargingStation);
      }
    }
  }

  private stopCharging(vehicle: Vehicle, chargingStation: ChargingStation): void {
    vehicle.status = Status.MOVING;
    this.afterChargingOrMoving(vehicle);
    chargingStation.remove(vehicle);
    this.routeGraphics.renderMovingVehicle(vehicle);
  }

  private afterChargingOrMoving(vehicle: Vehicle): void {
    vehicle.totalTime += (this.clock.time - vehicle.startTime); // keep a total
    vehicle.startTime = this.clock.time; // start charging or moving time
    vehicle.startSOC = vehicle.soc;
  }
}
