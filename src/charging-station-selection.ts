import Graphics = Phaser.GameObjects.Graphics;
import Container = Phaser.GameObjects.Container;
import {Scene} from "phaser";
import {ChargingStationFactory} from "./charging-station-factory";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import {RouteGraphics} from "./route-graphics";
import {ChoseNumberComponent} from "./chose-number-component";
import {CommonStyle} from "./common-style";
import {GameButton} from "./game-button";

export class ChargingStationSelection {

  private eventDispatcher: EvtripEventDispatcher;
  private backScreen: Graphics;
  private distanceSelected: number;
  private container: Container;

  constructor(eventDispatcher: EvtripEventDispatcher) {
    this.eventDispatcher = eventDispatcher;
  }

  create(scene: Scene): void {
    this.container = scene.add.container(30, 200);
    this.container.setDepth(1);
    this.container.setVisible(false);

    this.backScreen = scene.make.graphics({
      fillStyle: {
        color: 0xffffff
      }
    });
    this.backScreen.fillRoundedRect(0, 0, 400, 280, 10);
    this.backScreen.lineStyle(5, 0x000000);
    this.backScreen.strokeRoundedRect(0, 0, 400, 280);
    this.backScreen.setDepth(1);
    this.container.add(this.backScreen);

    let title = scene.make.text({});
    title.setText("Add charging station")
    title.setPosition(10, 10);
    title.setStyle(CommonStyle.NORMAL_STYLE); // need to set, probably a bug
    this.container.add(title);

    let choseCapacity = new ChoseNumberComponent(ChargingStationFactory.CAPACITIES);
    let containerCapacity = choseCapacity.create(this.container, scene, 110);
    this.container.add(containerCapacity);
    containerCapacity.setPosition(10, 70);

    let slotValues = [1, 2, 3, 4, 5, 6, 7, 9, 10];
    let choseSlots = new ChoseNumberComponent(slotValues);
    let containerSlots = choseSlots.create(this.container, scene, 70);
    this.container.add(containerSlots);
    containerSlots.setPosition(10, 120);

    let distanceSelected = scene.make.text({});
    distanceSelected.setText("Distance: select on road")
    distanceSelected.setPosition(10, 170);
    distanceSelected.setStyle(CommonStyle.NORMAL_STYLE); // need to set, probably a bug
    this.container.add(distanceSelected);

    this.eventDispatcher.on('distanceselected', (distance: number) => {
      if (distance >= 0 && distance <= RouteGraphics.DISTANCE_METRES) {
        const kms = Math.floor(distance / 1000);
        distanceSelected.setText("Distance: " + kms);
        this.distanceSelected = kms*1000;
      }
    });

    const addButtonContainer = scene.make.container({});
    this.container.add(addButtonContainer);
    let addButton = new GameButton();
    addButton.create(scene, addButtonContainer, "Add", 150);
    addButtonContainer.setPosition(10, 220);
    addButton.setAction(() => {
      let power = choseCapacity.getValue();
      let distance = this.distanceSelected;
      let slots = choseSlots.getValue();
      this.eventDispatcher.emit('addchargingstation', power, distance, slots);
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

  show() {
    this.container.visible = !this.container.visible
  }
}
