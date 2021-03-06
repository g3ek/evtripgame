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
import {Controller} from "./controller";
import {ChargingStation} from "./charging-station";

export class ChargingStationSelection {

  private readonly DEFAULT_TEXT = "Add charging station";

  private eventDispatcher: EvtripEventDispatcher;
  private backScreen: Graphics;
  private distanceSelected: number = null;
  private container: Container;
  private levelScore: LevelScore;
  private titleMessage: Text;
  private choseCapacity: ChoseNumberComponent;
  private choseSlots: ChoseNumberComponent;
  private controller: Controller;
  private costField: Text;
  private chargingStation: ChargingStation = null;
  private editButton: GameButton;
  private addButton: GameButton;

  constructor(eventDispatcher: EvtripEventDispatcher, levelScore: LevelScore, controller: Controller) {
    this.eventDispatcher = eventDispatcher;
    this.levelScore = levelScore;
    this.controller = controller;
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
    this.backScreen.fillRoundedRect(0, 0, 400, 320, 10);
    this.backScreen.lineStyle(5, 0x000000);
    this.backScreen.strokeRoundedRect(0, 0, 400, 320);
    this.backScreen.setDepth(1);
    this.container.add(this.backScreen);

    this.titleMessage = scene.make.text({});
    this.titleMessage.setText(this.DEFAULT_TEXT)
    this.titleMessage.setPosition(10, 10);
    this.titleMessage.setStyle(CommonStyle.NORMAL_STYLE); // need to set, probably a bug
    this.container.add(this.titleMessage);

    this.choseCapacity = new ChoseNumberComponent(this.levelScore.getLevel().capacities);
    let containerCapacity = this.choseCapacity.create(scene, 190);
    this.container.add(containerCapacity);
    containerCapacity.setPosition(10, 50);

    let slotValues = [2, 4, 8, 10];
    this.choseSlots = new ChoseNumberComponent(slotValues);
    let containerSlots = this.choseSlots.create(scene, 110);
    this.container.add(containerSlots);
    containerSlots.setPosition(10, 120);

    this.costField = scene.make.text({});
    this.costField.setStyle(CommonStyle.NORMAL_STYLE);
    this.costField.setText("Cost: $20000");
    this.costField.setPosition(10, 175);
    this.container.add(this.costField);
    this.choseSlots.setAction(() => {
      this.calculateAndSetCost();
    });
    this.choseCapacity.setAction(() => {
      this.calculateAndSetCost();
    });

    let distanceSelected = scene.make.text({});
    distanceSelected.setText("Distance: select on road")
    distanceSelected.setPosition(10, 210);
    distanceSelected.setStyle(CommonStyle.NORMAL_STYLE); // need to set, probably a bug
    this.container.add(distanceSelected);

    this.eventDispatcher.on('distanceselected', (distance: number) => {
      if (distance >= 0 && distance <= RouteGraphics.DISTANCE_METRES) {
        const kms = Math.floor(distance / 1000);
        distanceSelected.setText("Distance: " + kms);
        this.distanceSelected = kms * 1000;
      }
    });

    const editButtonContainer = scene.make.container({});
    this.container.add(editButtonContainer);
    this.editButton = new GameButton();
    this.editButton.create(scene, editButtonContainer, "Save", 150);
    editButtonContainer.setPosition(10, 255);
    editButtonContainer.visible = false;
    this.editButton.setAction(() => {
      if (this.choseCapacity.getValue() > this.chargingStation.power ||
        this.choseSlots.getValue() > this.chargingStation.slots) {
        const requiredMoney = this.calculateAndSetCost();
        if (requiredMoney <= this.levelScore.money) {
          this.chargingStation.slots = this.choseSlots.getValue();
          this.chargingStation.power = this.choseCapacity.getValue();
          this.eventDispatcher.emit('updatechargingstation', this.chargingStation);
          this.levelScore.buy(requiredMoney);
          this.titleMessage.setText(this.DEFAULT_TEXT);
          this.container.visible = false;
        } else {
          this.titleMessage.setText("Not enough $!");
        }
      } else {
        this.titleMessage.setText("Upgrade only.");
      }
    });

    const addButtonContainer = scene.make.container({});
    this.container.add(addButtonContainer);
    this.addButton = new GameButton();
    this.addButton.create(scene, addButtonContainer, "Add", 150);
    addButtonContainer.setPosition(10, 255);
    this.addButton.setAction(() => {
      if (this.controller.nearChargingStation(this.distanceSelected)) {
        this.titleMessage.setText("Location not available");
      } else if (this.distanceSelected !== null) {
        let power = this.choseCapacity.getValue();
        let distance = this.distanceSelected;
        let slots = this.choseSlots.getValue();
        const requiredMoney = this.calculateAndSetCost();
        if (requiredMoney <= this.levelScore.money) {
          this.eventDispatcher.emit('addchargingstation', power, distance, slots);
          this.levelScore.buy(requiredMoney);
          this.titleMessage.setText(this.DEFAULT_TEXT);
          this.container.visible = false;
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
    closeButtonContainer.setPosition(170, 255);
    closeButton.setAction(() => {
      this.container.visible = false;
    });
  }

  nextLevel() {
    this.choseCapacity.values = this.levelScore.getLevel().capacities;
  }

  show() {
    this.chargingStation = null;
    this.editButton.visible(false);
    this.addButton.visible(true);
    this.titleMessage.setText("Add charging station");
    this.container.visible = true;
  }

  modify(chargingStation: ChargingStation) {
    this.chargingStation = chargingStation;
    this.editButton.visible(true);
    this.addButton.visible(false);
    this.choseCapacity.setValue(chargingStation.power);
    this.choseSlots.setValue(chargingStation.slots);
    this.titleMessage.setText("Edit charging station");
    this.container.visible = true;
  }

  calculateAndSetCost(): number {
    if (this.chargingStation === null) {
      let power = this.choseCapacity.getValue();
      let slots = this.choseSlots.getValue();
      const requiredMoney = power * (slots / 2);
      this.costField.setText("Cost: $" + requiredMoney);
      return requiredMoney;
    } else {
      let power = this.choseCapacity.getValue();
      let slots = this.choseSlots.getValue() - this.chargingStation.slots;
      const requiredMoney = power * (slots / 2);
      this.costField.setText("Cost: $" + requiredMoney);
      return requiredMoney;
    }
  }
}
