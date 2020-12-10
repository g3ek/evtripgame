import {VehicleSprite} from "./vehicle-sprite";
import {RouteGraphics} from "./route-graphics";
import {ChargingStationSprite} from "./charging-station-sprite";
import {Status, Vehicle} from "./vehicle";
import {ChargingStation} from "./charging-station";

export class Controller {

  static readonly TIMEFACTOR: number = 16;

  private _vehicles: VehicleSprite[] = [];
  private chargingStations: ChargingStationSprite[] = [];
  private routeGraphics: RouteGraphics;

  constructor(routeGraphics: RouteGraphics) {
    this.routeGraphics = routeGraphics;
  }

  addVehicle(vehicleSprite: VehicleSprite): void {
    this._vehicles.push(vehicleSprite);
  }

  addChargingStation(csSprite: ChargingStationSprite) {
    this.chargingStations.push(csSprite);
  }

  update(delta: number): void {
    this._vehicles.forEach(sprite => {
      this.updateVehicle(sprite);
    });
    this.chargingStations.forEach(cs => {

    })
  }

  get vehicles(): VehicleSprite[] {
    return this._vehicles;
  }

  private updateVehicle(vehicleSprite: VehicleSprite) {
    const vehicle = vehicleSprite.getVehicle();
    if (vehicle.status === Status.MOVING) {
      const delta = (Date.now() - vehicle.startTime) * Controller.TIMEFACTOR;
      const distance = (delta / 1000) * vehicle.mpsSpeed;
      // /1000 b/c consumtion is per km
      const wattHoursPerMeter = (vehicle.consumption / 1000) * distance;
      let soc = vehicle.startSOC - wattHoursPerMeter;
      vehicle.soc = soc;
      const needToCharge = this.isChargingNecessaryHandler(vehicleSprite, distance);
      if (!needToCharge) {
        vehicle.distance = distance;
      }
    }
  }

  private isChargingNecessaryHandler(vehicleSprite: VehicleSprite, distance: number): boolean {
    const vehicle = vehicleSprite.getVehicle();
    const oldDistance = vehicle.distance; // previously attained distance
    this.chargingStations.forEach(csSprite => {
      let chargingStation = csSprite.chargingStation;
      let csLocation = chargingStation.locationInMeters;
      let inVicinity = csLocation > oldDistance && csLocation < distance;
      if (inVicinity) {
        let doNeedToChargeHere = this.doINeedToChargeHere(vehicle, chargingStation, distance);
        if (doNeedToChargeHere) {
          vehicle.status = Status.CHARGING;
          chargingStation.add(vehicle);
          this.routeGraphics.renderChargingVehicle(vehicleSprite, csSprite);
          return true;
        }
      }
    });
    return false;
  }

  private doINeedToChargeHere(vehicle: Vehicle, chargingStation: ChargingStation, distance: number): boolean {
    let distanceRemaining = RouteGraphics.DISTANCE_METRES - distance;
    const energyNeeds = (vehicle.consumption / 1000) * distanceRemaining;
    if (vehicle.soc - energyNeeds < 0) {
      let nextChargingStations = this.findNextChargingStations(chargingStation);
      let stopAtNextOne = nextChargingStations.some(cs => {
        let distanceTo = cs.locationInMeters - distance;
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
      return cs.chargingStation.locationInMeters > chargingStation.locationInMeters;
    }).map(cs => {
      return cs.chargingStation;
    });
  }
}
