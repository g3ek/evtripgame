import {Scene} from "phaser";
import {ChargingStation} from "./charging-station";
import {Vehicle} from "./vehicle";
import DOMElement = Phaser.GameObjects.DOMElement;

export class ChargingStationStats {

  private key: string;
  private form: DOMElement;

  constructor(key: string) {
    this.key = key;
  }

  create(scene: Scene): void {
    this.form = scene.add.dom(30, 750).createFromCache(this.key);
  }

  show(chargingStation: ChargingStation): void {
    let table = this.form.getChildByID('stationtable');
    let display = table.getAttribute('style');
    if (display === null) {
      table.setAttribute('style', 'display: block');
      this.showVehicleStats(chargingStation.vehicles);
    } else {
      table.removeAttribute('style');
      let tableBody = this.form.getChildByName('tablebody');
      let children = tableBody.children;
      for(let i=0; i < children.length; i++) {
        tableBody.removeChild(children.item(i));
      }
    }
  }

  private showVehicleStats(vehicles: Vehicle[]) {
    let tableBody = this.form.getChildByID("tablebody");

    for(let i=0; i < vehicles.length; i++) {
      if (vehicles[i] !== null) {
        let row = tableBody.ownerDocument.createElement('tr');
        let socTD = tableBody.ownerDocument.createElement('td')
        row.appendChild(socTD);
        socTD.textContent = '' + vehicles[i].soc;
        tableBody.appendChild(row);
      }
    }
  }
}
