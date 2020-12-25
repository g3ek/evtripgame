import {Scene} from "phaser";
import {ChargingStation} from "./charging-station";
import {Vehicle} from "./vehicle";
import {Subscription} from "rxjs";
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

  show(chargingStation: ChargingStation): void {
    let table = this.form.getChildByID('stationtable');
    if (this.current === null) {
      this.current = chargingStation;
      table.setAttribute('style', 'display: block');
      this.showVehicleStats(chargingStation.vehicles);
    } else if (this.current !== chargingStation) {
      this.cleanup();
      this.current = chargingStation;
      this.showVehicleStats(chargingStation.vehicles);
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
    for(let i=0; i < children.length; i++) {
      tableBody.removeChild(children.item(i));
    }
  }

  private showVehicleStats(vehicles: Vehicle[]) {
    let tableBody = this.form.getChildByID("tablebody");

    for(let i=0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      if (vehicle !== null) {
        let row = tableBody.ownerDocument.createElement('tr');
        let socTD = tableBody.ownerDocument.createElement('td')
        let actionTD = tableBody.ownerDocument.createElement('td')
        row.appendChild(socTD);
        row.appendChild(actionTD);
        //socTD.textContent = '' + vehicle.soc;
        actionTD.textContent = 'Action'
        tableBody.appendChild(row);
        const factor = vehicle.capacity / 100;
        let subscription = vehicle.observable.subscribe(v => {
          const socPercent = Math.round((v.soc / factor)*100) / 100;
          socTD.textContent = '' + socPercent;
        });
        this.subscriptions.push(subscription);
      }
    }
  }
}
