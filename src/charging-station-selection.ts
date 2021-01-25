import Graphics = Phaser.GameObjects.Graphics;
import Container = Phaser.GameObjects.Container;
import Text = Phaser.GameObjects.Text;
import {Scene} from "phaser";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import {RouteGraphics} from "./route-graphics";
import {ChoseNumberComponent} from "./chose-number-component";
import {CommonStyle} from "./common-style";
import {GameButton} from "./game-button";
import {LevelScore} from "./level-score";

export class ChargingStationSelection {

  private eventDispatcher: EvtripEventDispatcher;
  private backScreen: Graphics;
  private distanceSelected: number = null;
  private container: Container;
  private levelScore: LevelScore;
  private titleMessage: Text;
  private choseCapacity: ChoseNumberComponent;

  constructor(eventDispatcher: EvtripEventDispatcher, levelScore: LevelScore) {
    this.eventDispatcher = eventDispatcher;
    this.levelScore = levelScore;
  }

  create(scene: Scene): void {
    this.container = scene.add.container(30, 200);
    this.container.setDepth(2);
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

    this.titleMessage = scene.make.text({});
    this.titleMessage.setText("Add charging station")
    this.titleMessage.setPosition(10, 10);
    this.titleMessage.setStyle(CommonStyle.NORMAL_STYLE); // need to set, probably a bug
    this.container.add(this.titleMessage);

    this.choseCapacity = new ChoseNumberComponent(this.levelScore.getLevel().capacities);
    let containerCapacity = this.choseCapacity.create(scene, 190);
    this.container.add(containerCapacity);
    containerCapacity.setPosition(10, 50);

    let slotValues = [2, 4, 8, 10];
    let choseSlots = new ChoseNumberComponent(slotValues);
    let containerSlots = choseSlots.create(scene, 110);
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
    const addButton = new GameButton();
    addButton.create(scene, addButtonContainer, "Add", 150);
    addButtonContainer.setPosition(10, 220);
    addButton.setAction(() => {
      if (this.distanceSelected !== null) {
        let power = this.choseCapacity.getValue();
        let distance = this.distanceSelected;
        let slots = choseSlots.getValue();
        const requiredMoney = power * (slots/2);
        if (requiredMoney <= this.levelScore.money) {
          this.eventDispatcher.emit('addchargingstation', power, distance, slots);
          this.levelScore.buy(requiredMoney);
        } else {
          this.titleMessage.setText("Not enough $!");
        }
      } else {
        this.titleMessage.setText("Click on road!");
      }
    });
    const closeButtonContainer = scene.make.container({});
    this.container.add(closeButtonContainer);
    const closeButton = new GameButton();
    closeButton.create(scene, closeButtonContainer, "Close", 160);
    closeButtonContainer.setPosition(170, 220);
    closeButton.setAction(() => {
      this.show();
    });
  }

  nextLevel() {
    this.choseCapacity.values = this.levelScore.getLevel().capacities;
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
    this.titleMessage.setText("Add charging station");
    this.container.visible = !this.container.visible
  }
}
