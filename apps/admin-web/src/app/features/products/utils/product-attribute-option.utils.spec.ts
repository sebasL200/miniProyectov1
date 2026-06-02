import { Attribute } from '../../../shared/models/attribute.model';
import { attributesToProductAttributeOptions } from './product-attribute-option.utils';

describe('product attribute option utils', () => {
    it('should exclude appliesToAll attributes from product form options', () => {
        const attributes = [
            {
                id: 'global-attribute-id',
                name: 'Brand',
                slug: 'brand',
                appliesToAll: true,
            },
            {
                id: 'category-attribute-id',
                name: 'Size',
                slug: 'size',
                appliesToAll: false,
            },
        ] as Attribute[];

        expect(attributesToProductAttributeOptions(attributes)).toEqual([
            {
                label: 'Size',
                value: {
                    id: 'category-attribute-id',
                    name: 'Size',
                    slug: 'size',
                },
            },
        ]);
    });
});
