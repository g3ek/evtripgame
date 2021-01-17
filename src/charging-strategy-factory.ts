import {AbstractChargingStrategy, ChargingStrategy, Strategy} from "./charging-strategy";
import {ChargingStrategyAnxiety} from "./charging-strategy-anxiety";
import {ChargingStrategyOpportunistic} from "./charging-strategy-opportunistic";
import {ChargingStrategyOptimal} from "./charging-strategy-optimal";

export class ChargingStrategyFactory {

  static createRandomStrategy(): ChargingStrategy {
    const strategyIndex = Math.floor(Math.random()*AbstractChargingStrategy.strategies.length);
    const strategy = AbstractChargingStrategy.strategies[strategyIndex];
    return ChargingStrategyFactory.createStrategy(strategy);
  }

  static createStrategy(strategy: Strategy): ChargingStrategy {
    switch (strategy) {
      case Strategy.ANXIETY:
        return new ChargingStrategyAnxiety();
      case Strategy.OPPORTUNISTIC:
        return new ChargingStrategyOpportunistic();
      case Strategy.OPTIMAL:
        return new ChargingStrategyOptimal();
      default:
        throw "Illegal argument: "+strategy;
    }
  }
}
