import { vsContainer } from '../../inversify.config';
import { TYPES } from '../../inversify.types';
import { HlcRenderSpec } from '../../util/hcl.util';
import VaultApi from '../vault.api';

let oidcDecoData: ejs.Data | undefined;

/**
 * Global oidc data decorator
 * @param target
 * @param propertyName
 * @param descriptor
 */
export default function oidcData(
  target: unknown,
  propertyName: string,
  descriptor: PropertyDescriptor,
): void {
  const method = descriptor.value as () => Promise<HlcRenderSpec[]>;

  descriptor.value = async function (...args: any) {
    const specArr = await method.apply(this, args);
    // Danger: IoC should not be used this way.
    // Decorators aren't bound to classes so this is the only way.
    const vaultApi = vsContainer.get<VaultApi>(TYPES.VaultApi);

    if (!oidcDecoData) {
      const accessor = (await vaultApi.getOidcAccessors())[0];
      oidcDecoData = {
        global_oidc_accessor: accessor,
      };
    }

    return specArr.map((spec) => {
      if (oidcDecoData) {
        spec.data = {
          ...spec.data,
          ...oidcDecoData,
        };
      }
      return spec;
    });
  };
}
