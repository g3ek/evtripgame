import {Status, Vehicle} from "./vehicle";

export class VehicleFactory {

  private static readonly CAPACITIES: number[] = [20000, 41000, 64000, 75000, 100000];

  create(): Vehicle {
    const kph = Phaser.Math.Between(90, 120);
    const mpsSpeed = kph / 3.6; // convert kph to mps
    let index = kph / 90;
    index = Math.pow(index, 2); // square 2 for air resistance
    let consumption = (Phaser.Math.Between(150, 250));
    consumption *= index;
    const directionup = Math.random()*2 < 1;
    const status = Status.NEW;
    const capacity: number = VehicleFactory.CAPACITIES[Math.floor(Math.random()*VehicleFactory.CAPACITIES.length)];
    const startSOC = Phaser.Math.Between(10000, capacity); // minimum 10kWh soc

    const vehicle = new Vehicle();
    vehicle.startSOC = startSOC;
    vehicle.soc = startSOC;
    vehicle.consumption = consumption;
    vehicle.capacity = capacity;
    vehicle.status = status;
    vehicle.mpsSpeed = mpsSpeed;
    vehicle.directionup = directionup;
    return vehicle;
  }
}
