import {VehicleSprite} from "./vehicle-sprite";
import {RouteGraphics} from "./route-graphics";

export class Controller {

  private _vehicles: VehicleSprite[] = [];
  private routeGraphics: RouteGraphics;

  constructor(routeGraphics: RouteGraphics) {
    this.routeGraphics = routeGraphics;
  }

  addVehicle(vehicleSprite: VehicleSprite): void {
    this._vehicles.push(vehicleSprite);
  }

  update(): void {
    this._vehicles.forEach(sprite => {
      let vehicle = sprite.getVehicle();
      const delta = (Date.now() - vehicle.startTime) * 16;
      const distance = (delta/1000) * vehicle.mpsSpeed;
      const wattHoursPerMeter = (vehicle.consumption/1000) * distance;
      let soc = vehicle.startSOC - wattHoursPerMeter;

      vehicle.distance = distance;
      vehicle.soc = soc;
    });
  }

  get vehicles(): VehicleSprite[] {
    return this._vehicles;
  }
}
