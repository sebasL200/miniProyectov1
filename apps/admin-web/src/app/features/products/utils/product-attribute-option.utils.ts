import { attributeToSummary } from '../../attributes/utils/attribute-summary.mapper';
import { ProductAttributeOption } from '../components/forms/product-form/types';
import { Attribute } from '../../../shared/models/attribute.model';

export const attributeToProductAttributeOption = (attribute: Attribute): ProductAttributeOption => ({
    label: attribute.name,
    value: attributeToSummary(attribute),
});

export const attributesToProductAttributeOptions = (
    attributes: Attribute[],
): ProductAttributeOption[] =>
    attributes
        .filter((attribute) => !attribute.appliesToAll)
        .map(attributeToProductAttributeOption);
