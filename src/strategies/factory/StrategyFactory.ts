/**
 * StrategyFactory
 * Factory pattern for creating chatbot behavior strategies
 */

import { IBehaviorStrategy } from '../base/IBehaviorStrategy.js';
import { StrategyType } from '../../types/strategy.types.js';
import { PortfolioStrategy } from '../implementations/PortfolioStrategy.js';
import { EcommerceStrategy } from '../implementations/EcommerceStrategy.js';

export class StrategyFactory {
  /**
   * Create a strategy instance based on type
   * @param type - The strategy type to create
   * @returns IBehaviorStrategy instance
   * @throws Error if strategy type is not supported
   */
  static createStrategy(type: StrategyType = 'default'): IBehaviorStrategy {
    switch (type) {
      case 'portfolio':
        return new PortfolioStrategy();
      
      case 'ecommerce':
        return new EcommerceStrategy();
      
      case 'support':
        // TODO: Implement in Phase 7.4
        throw new Error('Support strategy not yet implemented');
      
      case 'default':
        // Return ecommerce as default for general use
        return new EcommerceStrategy();
      
      default:
        throw new Error(`Unknown strategy type: ${type}`);
    }
  }

  /**
   * Get list of available strategy types
   */
  static getAvailableStrategies(): StrategyType[] {
    return ['portfolio', 'ecommerce', 'default'];
  }

  /**
   * Check if a strategy type is supported
   */
  static isStrategySupported(type: StrategyType): boolean {
    try {
      this.createStrategy(type);
      return true;
    } catch {
      return false;
    }
  }
}
