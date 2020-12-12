import {VehicleSprite} from "./vehicle-sprite";
import {RouteGraphics} from "./route-graphics";
import {ChargingStationSprite} from "./charging-station-sprite";
import {Status, Vehicle} from "./vehicle";
import {ChargingStation} from "./charging-station";

export class Controller {

  static readonly TIMEFACTOR: number = 20;

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
      if (cs.chargingStation.vehicles.length > 0) {
        this.chargeVehicles(cs.chargingStation);
      }
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
        if (vehicle.totalDistance > RouteGraphics.DISTANCE_METRES) {
          vehicleSprite.sprite().destroy(false);
          this._vehicles = this._vehicles.filter(v => v !== vehicleSprite);
        }
      }
    }
  }

  private isChargingNecessaryHandler(vehicleSprite: VehicleSprite, distance: number): boolean {
    const vehicle = vehicleSprite.getVehicle();
    const oldDistance = vehicle.totalDistance; // previously attained distance
    const newDistance = vehicle.startDistance + distance;
    this.chargingStations.forEach(csSprite => {
      let chargingStation = csSprite.chargingStation;
      let csLocation = chargingStation.locationInMeters;
      let inVicinity = csLocation > oldDistance && csLocation < newDistance;
      if (inVicinity) {
        let doNeedToChargeHere = this.doINeedToChargeHere(vehicle, chargingStation, newDistance);
        if (doNeedToChargeHere) {
          vehicle.status = Status.CHARGING;
          vehicle.startDistance = newDistance; // make the distance AFTER the cs
          vehicle.distance = 0;
          this.afterChargingOrMoving(vehicle);
          chargingStation.add(vehicle);
          this.routeGraphics.renderChargingVehicle(vehicleSprite, csSprite);
          return true;
        }
      }
    });
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
      return cs.chargingStation.locationInMeters > chargingStation.locationInMeters;
    }).map(cs => {
      return cs.chargingStation;
    });
  }

  private chargeVehicles(chargingStation: ChargingStation) {
    chargingStation.vehicles.forEach(vehicle => {
      const chargingTime = (Date.now() - vehicle.startTime) * Controller.TIMEFACTOR;
      // 3600000 to convert hour to ms
      const energy = (chargingStation.power / 3600000) * chargingTime;
      vehicle.soc = vehicle.startSOC + energy;
      let doINeedToContinueChargingHere = this.doINeedToChargeHere(vehicle, chargingStation, vehicle.distance);
      if (!doINeedToContinueChargingHere) {
        vehicle.status = Status.MOVING;
        this.afterChargingOrMoving(vehicle);
        chargingStation.remove(vehicle);
        const vSprite = this.findVehicleSprite(vehicle);
        this.routeGraphics.renderMovingVehicle(vSprite);
      }
    });
  }

  private afterChargingOrMoving(vehicle: Vehicle): void {
    vehicle.totalTime += (Date.now() - vehicle.startTime); // keep a total
    vehicle.startTime = Date.now(); // start charging or moving time
    vehicle.startSOC = vehicle.soc;
  }

  private findVehicleSprite(vehicle: Vehicle): VehicleSprite {
    let vehicleSprites = this.vehicles.filter(vSprite => {
      return vSprite.getVehicle() === vehicle;
    });
    return vehicleSprites[0];
  }
}
