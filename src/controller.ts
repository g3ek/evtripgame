import {RouteGraphics} from "./route-graphics";
import {Status, Vehicle} from "./vehicle";
import {ChargingStation} from "./charging-station";
import {Clock} from "./clock";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";

export class Controller {

  private _vehicles: Vehicle[] = [];
  private chargingStations: ChargingStation[] = [];
  private routeGraphics: RouteGraphics;
  private clock: Clock;
  private eventDispatcher: EvtripEventDispatcher;

  constructor(routeGraphics: RouteGraphics, clock: Clock, eventDispatcher: EvtripEventDispatcher) {
    this.routeGraphics = routeGraphics;
    this.clock = clock;
    this.eventDispatcher = eventDispatcher;
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
      return csLocation >= oldDistance && csLocation <= newDistance;
    });
    if (nearestChargingStations.length > 0) {
      const chargingStation = nearestChargingStations[0];
      const chargingStrategy = vehicle.chargingStrategy;
      let doNeedToChargeHere = chargingStrategy.determineChargingNeed(this.chargingStations, vehicle, chargingStation, newDistance);
      if (doNeedToChargeHere && chargingStation !== vehicle.latestChargingStation) {
        if (chargingStation.isFull()) {
          vehicle.status = Status.WAITING;
          chargingStation.addWaiting(vehicle);
          this.routeGraphics.renderWaitingVehicle(vehicle, chargingStation);
        } else {
          this.startCharging(chargingStation, vehicle);
          this.routeGraphics.renderChargingVehicle(vehicle, chargingStation);
        }
        this.eventDispatcher.emit('updatechargingstation', chargingStation);
        vehicle.latestChargingStation = chargingStation;

        return true;
      }
    }
    return false;
  }

  private startCharging(chargingStation: ChargingStation, vehicle: Vehicle) {
    vehicle.status = Status.CHARGING;
    vehicle.startDistance = chargingStation.locationInMeters;
    vehicle.distance = 0;
    chargingStation.add(vehicle);
    this.afterChargingOrMoving(vehicle);
  }

  private chargeVehicles(chargingStation: ChargingStation) {
    for (let i = 0; i < chargingStation.vehicles.length; i++) {
      const vehicle = chargingStation.vehicles[i];
      if (vehicle !== null) {
        const chargingTime = (this.clock.time - vehicle.startTime);
        // 3600000 to convert hour to ms
        const energy = (chargingStation.power / 3600000) * chargingTime;
        vehicle.soc = vehicle.startSOC + energy;
        if (vehicle.soc >= vehicle.capacity) {
          vehicle.soc = vehicle.capacity;
          this.stopCharging(vehicle, chargingStation);
          this.activateWaitingVehicle(chargingStation);
          this.eventDispatcher.emit('updatechargingstation', chargingStation);
        } else {
          let chargingStrategy = vehicle.chargingStrategy;
          let doINeedToContinueChargingHere = chargingStrategy.determineChargingNeed(this.chargingStations, vehicle, chargingStation, vehicle.totalDistance);
          if (!doINeedToContinueChargingHere) {
            this.stopCharging(vehicle, chargingStation);
            this.activateWaitingVehicle(chargingStation);
            this.eventDispatcher.emit('updatechargingstation', chargingStation);
          }
        }
      }
    }
  }

  private stopCharging(vehicle: Vehicle, chargingStation: ChargingStation): void {
    vehicle.status = Status.MOVING;
    this.afterChargingOrMoving(vehicle);
    chargingStation.remove(vehicle);
    this.routeGraphics.renderMovingVehicle(vehicle, chargingStation);
  }

  private activateWaitingVehicle(chargingStation: ChargingStation): void {
    if (chargingStation.isFull() || !chargingStation.hasWaiting()) {
      return;
    }
    let vehicles = chargingStation.waiting.sort((a, b) => {
      let result = 0;
      if (a.startTime < b.startTime) {
        result = -1;
      } else if (a.startTime > b.startTime) {
        result = 0;
      }
      return result;
    });
    const vehicle = vehicles[0];
    chargingStation.removeWaiting(vehicle);
    this.startCharging(chargingStation, vehicle);
    this.routeGraphics.renderChargingVehicle(vehicle, chargingStation);
  }

  private afterChargingOrMoving(vehicle: Vehicle): void {
    vehicle.totalTime += (this.clock.time - vehicle.startTime); // keep a total
    vehicle.startTime = this.clock.time; // start charging or moving time
    vehicle.startSOC = vehicle.soc;
  }
}
