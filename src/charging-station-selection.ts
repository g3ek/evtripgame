import DOMElement = Phaser.GameObjects.DOMElement;
import {Scene} from "phaser";
import {ChargingStationFactory} from "./charging-station-factory";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import {RouteGraphics} from "./route-graphics";

export class ChargingStationSelection {

  private form: DOMElement;
  private key: string;
  private eventDispatcher: EvtripEventDispatcher;

  constructor(key: string, eventDispatcher: EvtripEventDispatcher) {
    this.key = key;
    this.eventDispatcher = eventDispatcher;
  }

  create(scene: Scene): void {
    this.form = scene.add.dom(160, 350).createFromCache(this.key);
    let select: HTMLSelectElement = <HTMLSelectElement>this.form.getChildByName("stations");
    //let options: HTMLOptionsCollection = this.form['options']; // todo avoid this notation
    ChargingStationFactory.CAPACITIES.forEach(power => {
      let option = new Option(power+"", power+"");
      select.appendChild(option);
    });
    let addButton = this.form.getChildByID("add");
    let distanceField = <HTMLInputElement>this.form.getChildByName("distance");
    let slotsField = <HTMLInputElement>this.form.getChildByName("slots");
    let messageElement = <HTMLParagraphElement>this.form.getChildByID("message");
    addButton.addEventListener('click', () => {
      messageElement.textContent = "Add station";
      const valid: boolean = this.validate(messageElement, distanceField);
      if (valid) {
        this.eventDispatcher.emit("addchargingstation", select.value, distanceField.value, slotsField.value);
      }
    });
  }

  private validate(messageElement: HTMLParagraphElement, distanceField: HTMLInputElement) {
    if (!distanceField.value.match("^[0-9]+$")) { // only accept numbers, nothing else
      messageElement.textContent = "Distance data incorrect.";
      return false;
    } else {
      const distance: number = Number(distanceField.value);
      if (distance * 1000 > RouteGraphics.DISTANCE_METRES) {
        messageElement.textContent = "Route is "+(RouteGraphics.DISTANCE_METRES/1000);
        return false;
      }
    }
    return true;
  }
}
