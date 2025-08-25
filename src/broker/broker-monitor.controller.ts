import { inject, injectable } from 'inversify';
import winston from 'winston';
import { exhaustMap, timer } from 'rxjs';
import { TYPES } from '../inversify.types';
import VaultPolicyController from '../vault/vault-policy.controller';
import VaultGroupController from '../vault/vault-group.controller';
import VaultApproleController from '../vault/vault-approle.controller';

@injectable()
/**
 * Broker monitor controller.
 */
export default class BrokerMonitorController {
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.Logger) private logger: winston.Logger,
    @inject(TYPES.VaultApproleController)
    private vaultApproleController: VaultApproleController,
    @inject(TYPES.VaultGroupController)
    private vaultGroupController: VaultGroupController,
    @inject(TYPES.VaultPolicyController)
    private vaultPolicyController: VaultPolicyController,
  ) {}

  /**
   * Monitor vault and sync changes
   * @param root The policy roots to monitor
   * @param monitorIntervalDuration The duration between each monitor check in milliseconds
   */
  public async monitor(
    root: string[],
    monitorIntervalDuration: number,
  ): Promise<void> {
    const source$ = timer(0, monitorIntervalDuration);

    source$
      .pipe(
        exhaustMap(async () => {
          const startMs = Date.now();
          console.log('---- sync start');
          await this.vaultPolicyController.sync(root);
          await this.vaultGroupController.sync();
          await this.vaultApproleController.sync();
          console.log(`---- sync end [${Date.now() - startMs}]`);
        }),
      )
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .subscribe(() => {});
  }
}
