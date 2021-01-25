import {ChargingStrategy, Strategy} from "./charging-strategy";
import {ChargingStrategyAnxiety} from "./charging-strategy-anxiety";
import {ChargingStrategyOpportunistic} from "./charging-strategy-opportunistic";
import {ChargingStrategyOptimal} from "./charging-strategy-optimal";

export class ChargingStrategyFactory {

  static createRandomStrategy(strategies: Strategy[]): ChargingStrategy {
    const strategyIndex = Math.floor(Math.random()*strategies.length);
    const strategy = strategies[strategyIndex];
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
