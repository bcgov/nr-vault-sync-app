import {vsContainer} from '../../inversify.config';
import {TYPES} from '../../inversify.types';
import {HlcRenderSpec} from '../../util/hcl.util';
import VaultApi from '../vault.api';

let oidcDecoData: ejs.Data | undefined;

/**
 * Global oidc data decorator
 * @param target
 * @param propertyName
 * @param descriptor
 */
export default function oidcData(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value!;

  descriptor.value = async function(...args: any) {
    const specArr: HlcRenderSpec[] = await method.apply(this, args);
    // Danger: IoC should not be used this way.
    // Decorators aren't bound to classes so this is the only way.
    const vaultApi = vsContainer.get<VaultApi>(TYPES.VaultApi);

    if (!oidcDecoData) {
      const accessor = await vaultApi.getOidcAccessor();
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
