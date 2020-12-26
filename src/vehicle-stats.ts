import {Scene} from "phaser";
import {Vehicle} from "./vehicle";
import {Subscription} from "rxjs";
import DOMElement = Phaser.GameObjects.DOMElement;

export class VehicleStats {

  private key: string;
  private form: DOMElement;
  private subscriptions: Subscription[] = [];
  private selectedVehicle: Vehicle;

  constructor(key: string) {
    this.key = key;
  }

  create(scene: Scene): void {
    this.form = scene.add.dom(30, 750).createFromCache(this.key);
  }

  show(vehicles: Vehicle[], selectedVehicle: Vehicle): void {
    this.selectedVehicle = selectedVehicle;
    let table = this.form.getChildByID('vehiclestable');
    let attribute = table.getAttribute('style');
    this.cleanup();
    this.showVehicleStats(vehicles);
    if (attribute === null) {
      table.setAttribute('style', 'display: block');
    }
  }

  cleanup(): void {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
    let tableBody = this.form.getChildByID('tablebody');
    let children = tableBody.children;
    for(let i=children.length-1; children.length > 0; i--) {
      children.item(i).remove();
    }
  }

  private showVehicleStats(vehicles: Vehicle[]) {
    let tableBody = this.form.getChildByID("tablebody");
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      let row = tableBody.ownerDocument.createElement('tr');
      if (this.selectedVehicle === vehicle) {
        row.setAttribute('style', 'font-weight: bold');
      }
      let idTD = tableBody.ownerDocument.createElement('td');
      let speedTD = tableBody.ownerDocument.createElement('td');
      let distanceTD = tableBody.ownerDocument.createElement('td');
      row.appendChild(idTD);
      row.appendChild(speedTD);
      row.appendChild(distanceTD);
      tableBody.appendChild(row);
      idTD.textContent = vehicle.id;
      speedTD.textContent = Math.floor(vehicle.mpsSpeed*3.6) + "";
      let subscription = vehicle.observable.subscribe(v => {
        distanceTD.textContent = '' + Math.floor(vehicle.totalDistance/1000);
      });
      this.subscriptions.push(subscription);
    }
  }

  refresh(vehicles: Vehicle[]) {
    let table = this.form.getChildByID('vehiclestable');
    let attribute = table.getAttribute('style');
    if (attribute !== null) {
      this.cleanup();
      this.showVehicleStats(vehicles);
    }
  }
}
