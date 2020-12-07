import {VehicleSprite} from "./vehicle-sprite";
import {RouteGraphics} from "./route-graphics";
import {ChargingStationSprite} from "./charging-station-sprite";
import {Vehicle} from "./vehicle";
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
      let vehicle = sprite.getVehicle();
      this.checkChargingStations(vehicle, delta);
      this.updateVehiclePosition(vehicle);
    });
  }

  get vehicles(): VehicleSprite[] {
    return this._vehicles;
  }

  private updateVehiclePosition(vehicle: Vehicle) {
    const delta = (Date.now() - vehicle.startTime) * Controller.TIMEFACTOR;
    const distance = (delta/1000) * vehicle.mpsSpeed;
    // /1000 b/c consumtion is per km
    const wattHoursPerMeter = (vehicle.consumption/1000) * distance;
    let soc = vehicle.startSOC - wattHoursPerMeter;
    vehicle.distance = distance;
    vehicle.soc = soc;
  }

  private checkChargingStations(vehicle: Vehicle, delta: number) {
    const deltaTotal = (Date.now() - vehicle.startTime) * Controller.TIMEFACTOR;
    const distance = (deltaTotal/1000) * vehicle.mpsSpeed;
    const deltaTotalNext = deltaTotal + (delta * Controller.TIMEFACTOR);
    const distanceNext = (deltaTotalNext/1000) * vehicle.mpsSpeed;
    this.chargingStations.forEach(csSprite => {
      let chargingStation = csSprite.chargingStation;
      let csLocation = chargingStation.locationInMeters;
      let inVicinity = csLocation > distance && csLocation < distanceNext;
      if (inVicinity) {
        let doNeedToChargeHere = this.doINeedToChargeHere(vehicle, chargingStation, distance);
        if (doNeedToChargeHere) {
          console.log("stop!!!");
        } else {
          console.log("continue...");
        }
      }
    });
  }

  private doINeedToChargeHere(vehicle: Vehicle, chargingStation: ChargingStation, distance: number): boolean {
    let distanceRemaining = RouteGraphics.DISTANCE_METRES - distance;
    const energyNeeds = (vehicle.consumption / 1000) * distanceRemaining;
    if (vehicle.soc - energyNeeds < 0) {
      let nextChargingStations = this.findNextChargingStations(chargingStation);
      let stopAtNextOne = nextChargingStations.some(cs => {
        let distanceTo = cs.locationInMeters - distance;
        let energyTo = (vehicle.consumption / 1000) * distanceTo;
        return vehicle.soc - energyTo > 0;
      });
      return !stopAtNextOne;
    }
    return false; // todo: should never happen, otherwise no challenge! ;-)
  }

  private findNextChargingStations(chargingStation: ChargingStation): ChargingStation[] {
    return this.chargingStations.filter(cs => {
      return cs.chargingStation.locationInMeters > chargingStation.locationInMeters;
    }).map(cs => {
      return cs.chargingStation;
    });
  }
}
