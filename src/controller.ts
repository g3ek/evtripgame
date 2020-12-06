import {VehicleSprite} from "./vehicle-sprite";
import {RouteGraphics} from "./route-graphics";
import {ChargingStationSprite} from "./charging-station-sprite";
import {Vehicle} from "./vehicle";

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

  update(): void {
    this._vehicles.forEach(sprite => {
      let vehicle = sprite.getVehicle();
      this.updateVehiclePosition(vehicle);
    });
  }

  get vehicles(): VehicleSprite[] {
    return this._vehicles;
  }

  private updateVehiclePosition(vehicle: Vehicle) {
    const delta = (Date.now() - vehicle.startTime) * Controller.TIMEFACTOR;
    const distance = (delta/1000) * vehicle.mpsSpeed;
    const wattHoursPerMeter = (vehicle.consumption/1000) * distance;
    let soc = vehicle.startSOC - wattHoursPerMeter;
    vehicle.distance = distance;
    vehicle.soc = soc;
  }
}
