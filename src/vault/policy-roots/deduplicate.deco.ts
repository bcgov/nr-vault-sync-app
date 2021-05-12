import {vsContainer} from '../../inversify.config';
import {TYPES} from '../../inversify.types';
import HclUtil, {HlcRenderSpec} from '../../util/hcl.util';

/**
 * Policy deduplication decorator
 * @param target
 * @param propertyName
 * @param descriptor
 */
export default function deduplicate(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value!;

  descriptor.value = async function(...args: any) {
    const set = new Set<string>();
    const specArr: HlcRenderSpec[] = await method.apply(this, args);
    // Danger: IoC should not be used this way.
    // Decorators aren't bound to classes so this is the only way.
    const hclUtil = vsContainer.get<HclUtil>(TYPES.HclUtil);
    return specArr.filter((spec) => {
      const name = hclUtil.renderName(spec);
      return !set.has(name) && !!set.add(name);
    });
  };
}
