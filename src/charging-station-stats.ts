import {Scene} from "phaser";
import {ChargingStation} from "./charging-station";
import {Vehicle} from "./vehicle";
import {Subscription} from "rxjs";
import {AbstractChargingStrategy} from "./charging-strategy";
import DOMElement = Phaser.GameObjects.DOMElement;

export class ChargingStationStats {

  private key: string;
  private form: DOMElement;
  private current: ChargingStation = null;
  private subscriptions: Subscription[] = [];

  constructor(key: string) {
    this.key = key;
  }

  create(scene: Scene): void {
    this.form = scene.add.dom(30, 750).createFromCache(this.key);
  }

  update(chargingStation: ChargingStation): void {
    if (chargingStation === this.current) {
      this.cleanup();
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    }
  }

  show(chargingStation: ChargingStation): void {
    let table = this.form.getChildByID('stationtable');
    if (this.current === null) {
      table.setAttribute('style', 'display: block');
      this.current = chargingStation;
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    } else if (this.current !== chargingStation) {
      this.cleanup();
      this.current = chargingStation;
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    } else {
      this.current = null;
      table.removeAttribute('style');
      this.cleanup();
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

  private showVehicleStats(vehicles: Vehicle[], waiting: Vehicle[]) {
    let tableBody = this.form.getChildByID("tablebody");
    for(let i=0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      if (vehicle !== null) {
        this.makeRow(vehicle, tableBody)
      }
    }
    for(let i=0; i < waiting.length; i++) {
      this.makeRow(waiting[i], tableBody);
    }
  }

  makeRow(vehicle: Vehicle, tableBody: Element): void {
    let row = tableBody.ownerDocument.createElement('tr');
    let idTD = tableBody.ownerDocument.createElement('td')
    let socTD = tableBody.ownerDocument.createElement('td')
    let strategyTD = tableBody.ownerDocument.createElement('td')
    let actionTD = tableBody.ownerDocument.createElement('td');
    row.appendChild(idTD);
    row.appendChild(socTD);
    row.appendChild(strategyTD);
    row.appendChild(actionTD);
    idTD.textContent = vehicle.id;
    actionTD.textContent = 'Action';
    strategyTD.textContent = AbstractChargingStrategy.getLabel(vehicle.chargingStrategy.type());
    tableBody.appendChild(row);
    const factor = vehicle.capacity / 100;
    let subscription = vehicle.observable.subscribe(v => {
      const socPercent = Math.round((v.soc / factor)*100) / 100;
      socTD.textContent = '' + socPercent;
    });
    this.subscriptions.push(subscription);
  }
}
